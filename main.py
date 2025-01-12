from instagram_private_api import Client, ClientCompatPatch
import json
import time
from datetime import datetime
import getpass
import os
import ssl
import certifi
import urllib3

# Disable SSL verification warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def create_ssl_context():
    """Create a custom SSL context that doesn't verify certificates"""
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    return context

def save_log(removed, failed):
    """Save the results to a log file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_data = {
        "timestamp": timestamp,
        "removed_users": removed,
        "failed_users": failed
    }
    
    filename = f"instagram_cleanup_log_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(log_data, f, indent=4)
    print(f"Log saved to {filename}")

def get_all_followers(api, user_id):
    """Get complete list of followers with pagination"""
    followers = []
    rank_token = Client.generate_uuid()
    has_more = True
    max_id = None
    
    while has_more:
        print(f"Fetching followers batch... (current count: {len(followers)})")
        try:
            if max_id:
                results = api.user_followers(user_id, rank_token=rank_token, max_id=max_id)
            else:
                results = api.user_followers(user_id, rank_token=rank_token)
            
            followers.extend(results.get('users', []))
            
            if results.get('big_list', False):
                max_id = results.get('next_max_id')
                has_more = max_id is not None
                # Sleep to avoid rate limiting
                time.sleep(2)
            else:
                has_more = False
                
        except Exception as e:
            print(f"Error fetching followers: {e}")
            break
    
    return followers

def get_all_following(api, user_id):
    """Get complete list of following with pagination"""
    following = []
    rank_token = Client.generate_uuid()
    has_more = True
    max_id = None
    
    while has_more:
        print(f"Fetching following batch... (current count: {len(following)})")
        try:
            if max_id:
                results = api.user_following(user_id, rank_token=rank_token, max_id=max_id)
            else:
                results = api.user_following(user_id, rank_token=rank_token)
            
            following.extend(results.get('users', []))
            
            if results.get('big_list', False):
                max_id = results.get('next_max_id')
                has_more = max_id is not None
                # Sleep to avoid rate limiting
                time.sleep(2)
            else:
                has_more = False
                
        except Exception as e:
            print(f"Error fetching following: {e}")
            break
    
    return following

def get_non_mutual_followers(api):
    """Get list of followers who you don't follow back"""
    try:
        # Get your user info
        user_id = api.authenticated_user_id
        print(f"\nFetching data for user ID: {user_id}")
        
        # Get complete lists of followers and following
        print("\nFetching all followers...")
        followers = get_all_followers(api, user_id)
        print(f"Total followers found: {len(followers)}")
        
        print("\nFetching all following...")
        following = get_all_following(api, user_id)
        print(f"Total following found: {len(following)}")
        
        # Convert to sets of user IDs
        follower_ids = {user['pk'] for user in followers}
        following_ids = {user['pk'] for user in following}
        
        print(f"\nTotal unique followers: {len(follower_ids)}")
        print(f"Total unique following: {len(following_ids)}")
        
        # Find users who follow you but you don't follow back
        non_mutual = follower_ids - following_ids
        print(f"Found {len(non_mutual)} non-mutual followers")
        
        # Get user info for non-mutual followers
        non_mutual_users = [user for user in followers if user['pk'] in non_mutual]
        return non_mutual_users
        
    except Exception as e:
        print(f"Error getting non-mutual followers: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response: {e.response.text}")
        return []

def remove_followers(api, users, dry_run=True):
    """Remove followers from the list"""
    removed = []
    failed = []
    
    for user in users:
        try:
            username = user['username']
            user_id = user['pk']
            print(f"Processing: {username}")
            
            if dry_run:
                print(f"[DRY RUN] Would remove follower: {username}")
                continue
            
            # Remove follower by blocking and unblocking (this is the only way with the API)
            success = api.block_user(user_id)
            time.sleep(1)  # Small delay
            api.unblock_user(user_id)
            
            if success:
                removed.append(username)
                print(f"Successfully removed follower: {username}")
                # Sleep to avoid hitting rate limits
                time.sleep(2)
            else:
                failed.append(username)
                print(f"Failed to remove follower: {username}")
                
        except Exception as e:
            print(f"Error processing user {username}: {e}")
            failed.append(username)
            
    return removed, failed

def get_credentials():
    """Get credentials from environment variables or prompt user"""
    username = os.getenv('INSTAGRAM_USERNAME')
    password = os.getenv('INSTAGRAM_PASSWORD')
    
    if not username:
        username = input("Enter your Instagram username: ")
    if not password:
        password = getpass.getpass("Enter your Instagram password: ")
        
    return username, password

def main():
    try:
        # Create SSL context
        ssl_context = create_ssl_context()
        
        # Get Instagram credentials
        username, password = get_credentials()
        
        # Login to Instagram with SSL context
        print("Logging in to Instagram...")
        api = Client(
            username, 
            password,
            timeout=30,
            verify=False  # Disable SSL verification
        )
        
        # Get non-mutual followers
        print("Getting list of non-mutual followers...")
        non_mutual = get_non_mutual_followers(api)
        
        if not non_mutual:
            print("No non-mutual followers found!")
            return
            
        print(f"\nFound {len(non_mutual)} non-mutual followers:")
        for user in non_mutual:
            print(f"- {user['username']}")
        
        # Ask for confirmation
        choice = input("\nDo you want to:\n1. Run in dry-run mode (no actual removals)\n2. Remove followers\n3. Exit\nChoice (1/2/3): ")
        
        if choice == "1":
            removed, failed = remove_followers(api, non_mutual, dry_run=True)
            print("\nDry run completed. No followers were actually removed.")
        elif choice == "2":
            print("\nWARNING: This will actually remove followers!")
            confirm = input("Are you sure you want to proceed? (yes/no): ")
            if confirm.lower() == "yes":
                removed, failed = remove_followers(api, non_mutual, dry_run=False)
                print(f"\nRemoved {len(removed)} followers")
                print(f"Failed to remove {len(failed)} followers")
                save_log(removed, failed)
            else:
                print("Operation cancelled.")
        else:
            print("Exiting...")
    
    except Exception as e:
        print(f"An error occurred: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response: {e.response.text}")
        if "login_required" in str(e):
            print("Login failed. Please check your username and password.")
        elif "checkpoint_required" in str(e):
            print("Instagram requires verification. Please log in through the app first and try again.")
        elif "SSLError" in str(e) or "CERTIFICATE_VERIFY_FAILED" in str(e):
            print("\nSSL Certificate Error. Try these solutions:")
            print("1. Install Python certificates:")
            print("   Run: /Applications/Python 3.13/Install Certificates.command")
            print("2. Or use environment variables:")
            print("   export INSTAGRAM_USERNAME='your_username'")
            print("   export INSTAGRAM_PASSWORD='your_password'")
            print("   python3 main.py")
        
if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Liser Platform
Tests all authentication, BagList CRUD, product management, and user operations
"""
import requests
import sys
import json
from datetime import datetime
import uuid

class LiserAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_baglist_id = None
        self.created_product_id = None

    def log(self, message, success=None):
        """Log test results with emojis"""
        if success is True:
            print(f"✅ {message}")
        elif success is False:
            print(f"❌ {message}")
        else:
            print(f"🔍 {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Execute a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if not headers:
            headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"Testing {name}...")

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✓ {name} - Status: {response.status_code}", True)
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                self.log(f"✗ {name} - Expected {expected_status}, got {response.status_code}", False)
                try:
                    self.log(f"Response: {response.json()}", False)
                except:
                    self.log(f"Response: {response.text}", False)
                return False, {}

        except Exception as e:
            self.log(f"✗ {name} - Error: {str(e)}", False)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_categories_endpoint(self):
        """Test categories endpoint"""
        return self.run_test("Get Categories", "GET", "categories", 200)

    def test_register_new_user(self):
        """Test user registration with new user"""
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "email": f"testuser_{timestamp}@liser.com",
            "password": "test123456",
            "username": f"testuser_{timestamp}",
            "display_name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "Register New User", 
            "POST", 
            "auth/register", 
            200, 
            register_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user = response['user']
            self.log(f"✓ Registered user: {self.user['username']}", True)
            return True
        return False

    def test_login_existing_user(self):
        """Test login with existing test user"""
        login_data = {
            "email": "test@liser.com",
            "password": "test123"
        }
        
        success, response = self.run_test(
            "Login Existing User",
            "POST",
            "auth/login", 
            200,
            login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user = response['user']
            self.log(f"✓ Logged in user: {self.user['username']}", True)
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test("Get Current User", "GET", "auth/me", 200)
        return success and 'id' in response

    def test_create_baglist(self):
        """Test creating a new BagList"""
        baglist_data = {
            "title": f"Test BagList {datetime.now().strftime('%H:%M:%S')}",
            "description": "Test description for API testing",
            "category": "Tech",
            "cover_image_url": "https://via.placeholder.com/400x300",
            "tags": ["test", "api"],
            "is_public": True
        }
        
        success, response = self.run_test(
            "Create BagList",
            "POST", 
            "baglists",
            200,
            baglist_data
        )
        
        if success and 'id' in response:
            self.created_baglist_id = response['id']
            self.log(f"✓ Created BagList ID: {self.created_baglist_id}", True)
            return True
        return False

    def test_get_my_baglists(self):
        """Test getting user's own BagLists"""
        return self.run_test("Get My BagLists", "GET", "baglists/my", 200)

    def test_get_public_baglists(self):
        """Test getting public BagLists with filters"""
        # Test without filters
        success1, _ = self.run_test("Get Public BagLists", "GET", "baglists", 200)
        
        # Test with category filter
        success2, _ = self.run_test("Get BagLists by Category", "GET", "baglists?category=Tech", 200)
        
        # Test with search
        success3, _ = self.run_test("Search BagLists", "GET", "baglists?search=test", 200)
        
        # Test with sort
        success4, _ = self.run_test("Sort BagLists", "GET", "baglists?sort=popular", 200)
        
        return success1 and success2 and success3 and success4

    def test_get_baglist_detail(self):
        """Test getting specific BagList details"""
        if not self.created_baglist_id:
            return False
        return self.run_test("Get BagList Detail", "GET", f"baglists/{self.created_baglist_id}", 200)

    def test_update_baglist(self):
        """Test updating a BagList"""
        if not self.created_baglist_id:
            return False
            
        update_data = {
            "title": "Updated Test BagList",
            "description": "Updated description",
            "category": "Fashion"
        }
        
        return self.run_test(
            "Update BagList",
            "PUT",
            f"baglists/{self.created_baglist_id}",
            200,
            update_data
        )

    def test_add_product_to_baglist(self):
        """Test adding a product to BagList"""
        if not self.created_baglist_id:
            return False
            
        product_data = {
            "name": "Test Product",
            "image_url": "https://via.placeholder.com/200x200",
            "price": 29.99,
            "currency": "USD",
            "link": "https://example.com/product",
            "description": "A test product for API testing"
        }
        
        success, response = self.run_test(
            "Add Product to BagList",
            "POST",
            f"baglists/{self.created_baglist_id}/products",
            200,
            product_data
        )
        
        if success and 'id' in response:
            self.created_product_id = response['id']
            self.log(f"✓ Added Product ID: {self.created_product_id}", True)
            return True
        return False

    def test_update_product(self):
        """Test updating a product"""
        if not self.created_baglist_id or not self.created_product_id:
            return False
            
        updated_product_data = {
            "name": "Updated Test Product",
            "image_url": "https://via.placeholder.com/200x200",
            "price": 39.99,
            "currency": "USD",
            "link": "https://example.com/updated-product",
            "description": "Updated test product description"
        }
        
        return self.run_test(
            "Update Product",
            "PUT", 
            f"baglists/{self.created_baglist_id}/products/{self.created_product_id}",
            200,
            updated_product_data
        )

    def test_favorite_operations(self):
        """Test favorite/unfavorite operations"""
        if not self.created_baglist_id:
            return False
            
        # Add to favorites
        success1, response1 = self.run_test("Add to Favorites", "POST", f"baglists/{self.created_baglist_id}/favorite", 200)
        
        # Remove from favorites
        success2, response2 = self.run_test("Remove from Favorites", "POST", f"baglists/{self.created_baglist_id}/favorite", 200)
        
        return success1 and success2

    def test_save_operations(self):
        """Test save/unsave operations"""
        if not self.created_baglist_id:
            return False
            
        # Add to saved
        success1, _ = self.run_test("Save BagList", "POST", f"baglists/{self.created_baglist_id}/save", 200)
        
        # Remove from saved  
        success2, _ = self.run_test("Unsave BagList", "POST", f"baglists/{self.created_baglist_id}/save", 200)
        
        return success1 and success2

    def test_get_user_saved(self):
        """Test getting user's saved BagLists"""
        return self.run_test("Get User Saved", "GET", "users/me/saved", 200)

    def test_get_user_favorites(self):
        """Test getting user's favorite BagLists"""
        return self.run_test("Get User Favorites", "GET", "users/me/favorites", 200)

    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.user:
            return False
        return self.run_test("Get User Profile", "GET", f"users/{self.user['username']}", 200)

    def test_delete_product(self):
        """Test deleting a product from BagList"""
        if not self.created_baglist_id or not self.created_product_id:
            return False
        return self.run_test("Delete Product", "DELETE", f"baglists/{self.created_baglist_id}/products/{self.created_product_id}", 200)

    def test_delete_baglist(self):
        """Test deleting a BagList"""
        if not self.created_baglist_id:
            return False
        return self.run_test("Delete BagList", "DELETE", f"baglists/{self.created_baglist_id}", 200)

    def test_invalid_endpoints(self):
        """Test invalid endpoints for proper error handling"""
        # Test non-existent BagList
        success1, _ = self.run_test("Get Non-existent BagList", "GET", "baglists/invalid-id", 404)
        
        # Test non-existent user
        success2, _ = self.run_test("Get Non-existent User", "GET", "users/nonexistentuser", 404)
        
        # Test unauthorized access
        old_token = self.token
        self.token = "invalid-token"
        success3, _ = self.run_test("Unauthorized Access", "GET", "auth/me", 401)
        self.token = old_token
        
        return success1 and success2 and success3

def main():
    """Main test execution"""
    print("🚀 Starting Liser API Comprehensive Testing")
    print("=" * 60)
    
    tester = LiserAPITester()
    
    # Test basic endpoints
    tester.test_root_endpoint()
    tester.test_categories_endpoint()
    
    # Test authentication flows
    print("\n📝 Testing Authentication...")
    if not tester.test_register_new_user():
        print("⚠️  Registration failed, trying existing user login...")
        if not tester.test_login_existing_user():
            print("❌ Authentication completely failed!")
            return 1
    
    tester.test_get_current_user()
    
    # Test BagList operations
    print("\n📋 Testing BagList Operations...")
    tester.test_create_baglist()
    tester.test_get_my_baglists()
    tester.test_get_public_baglists()
    tester.test_get_baglist_detail()
    tester.test_update_baglist()
    
    # Test Product operations
    print("\n📦 Testing Product Operations...")
    tester.test_add_product_to_baglist()
    tester.test_update_product()
    
    # Test Favorites & Saves
    print("\n❤️ Testing Favorites & Saves...")
    tester.test_favorite_operations()
    tester.test_save_operations()
    tester.test_get_user_saved()
    tester.test_get_user_favorites()
    
    # Test User operations
    print("\n👤 Testing User Operations...")
    tester.test_get_user_profile()
    
    # Test cleanup and error handling
    print("\n🧹 Testing Cleanup & Error Handling...")
    tester.test_delete_product()
    tester.test_delete_baglist()
    tester.test_invalid_endpoints()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API tests mostly successful!")
        return 0
    else:
        print("⚠️  Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())
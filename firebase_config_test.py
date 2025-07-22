#!/usr/bin/env python3
"""
Firebase Configuration and Dependencies Test
Tests Firebase setup, configuration, and React Native dependencies
"""

import json
import os
import sys
from pathlib import Path

def test_firebase_configuration():
    """Test Firebase configuration files and setup"""
    print("🔧 Testing Firebase Configuration...")
    
    results = []
    
    # Test 1: Check firebase.js configuration
    try:
        firebase_config_path = "/app/src/config/firebase.js"
        if os.path.exists(firebase_config_path):
            with open(firebase_config_path, 'r') as f:
                content = f.read()
                
            # Check for required imports
            required_imports = [
                "@react-native-firebase/app",
                "@react-native-firebase/auth", 
                "@react-native-firebase/firestore",
                "@react-native-firebase/functions",
                "@react-native-google-signin/google-signin"
            ]
            
            missing_imports = []
            for imp in required_imports:
                if imp not in content:
                    missing_imports.append(imp)
            
            if not missing_imports:
                results.append(("Firebase Imports", True, "All required Firebase imports found"))
            else:
                results.append(("Firebase Imports", False, f"Missing imports: {missing_imports}"))
            
            # Check for collections definition
            if "collections = {" in content:
                results.append(("Collections Definition", True, "Firebase collections properly defined"))
            else:
                results.append(("Collections Definition", False, "Collections definition not found"))
            
            # Check for Google Sign-In configuration
            if "439803992286-t0tv25oh59dumc53bhi3i5vm871doh20.apps.googleusercontent.com" in content:
                results.append(("Google Sign-In Config", True, "Google Sign-In web client ID configured"))
            else:
                results.append(("Google Sign-In Config", False, "Google Sign-In web client ID not found"))
                
        else:
            results.append(("Firebase Config File", False, "firebase.js not found"))
            
    except Exception as e:
        results.append(("Firebase Configuration", False, f"Error: {str(e)}"))
    
    return results

def test_package_dependencies():
    """Test React Native Firebase package dependencies"""
    print("📦 Testing Package Dependencies...")
    
    results = []
    
    try:
        package_json_path = "/app/package.json"
        if os.path.exists(package_json_path):
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            dependencies = package_data.get('dependencies', {})
            
            # Required Firebase packages
            required_packages = {
                "@react-native-firebase/app": "Firebase Core",
                "@react-native-firebase/auth": "Firebase Authentication", 
                "@react-native-firebase/firestore": "Firebase Firestore",
                "@react-native-firebase/functions": "Firebase Functions",
                "@react-native-google-signin/google-signin": "Google Sign-In",
                "@invertase/react-native-apple-authentication": "Apple Sign-In"
            }
            
            for package, description in required_packages.items():
                if package in dependencies:
                    version = dependencies[package]
                    results.append((f"{description} Package", True, f"Installed: {package}@{version}"))
                else:
                    results.append((f"{description} Package", False, f"Missing: {package}"))
                    
        else:
            results.append(("Package.json", False, "package.json not found"))
            
    except Exception as e:
        results.append(("Package Dependencies", False, f"Error: {str(e)}"))
    
    return results

def test_service_implementations():
    """Test service implementation completeness"""
    print("🔍 Testing Service Implementations...")
    
    results = []
    
    services = {
        "/app/src/services/UserService.js": "UserService",
        "/app/src/services/ChatService.js": "ChatService", 
        "/app/src/services/MatchmakingService.js": "MatchmakingService",
        "/app/src/services/AuthService.js": "AuthService",
        "/app/src/context/AuthContext.js": "AuthContext"
    }
    
    for file_path, service_name in services.items():
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Check for class/export definition
                if f"export class {service_name}" in content or f"export const {service_name}" in content:
                    results.append((f"{service_name} Implementation", True, f"{service_name} properly exported"))
                else:
                    results.append((f"{service_name} Implementation", False, f"{service_name} export not found"))
                
                # Check for Firebase imports
                if "@react-native-firebase" in content:
                    results.append((f"{service_name} Firebase Integration", True, "Firebase imports found"))
                else:
                    results.append((f"{service_name} Firebase Integration", False, "No Firebase imports"))
                    
            else:
                results.append((f"{service_name} File", False, f"File not found: {file_path}"))
                
        except Exception as e:
            results.append((f"{service_name} Test", False, f"Error: {str(e)}"))
    
    return results

def test_helper_utilities():
    """Test helper utilities and constants"""
    print("🛠️ Testing Helper Utilities...")
    
    results = []
    
    try:
        helpers_path = "/app/src/utils/helpers.js"
        if os.path.exists(helpers_path):
            with open(helpers_path, 'r') as f:
                content = f.read()
            
            # Check for required helper functions
            required_functions = [
                "generateReferralCode",
                "formatTime", 
                "getCurrentDateString",
                "creditsToTime",
                "timeToCredits"
            ]
            
            missing_functions = []
            for func in required_functions:
                if f"export const {func}" not in content and f"const {func}" not in content:
                    missing_functions.append(func)
            
            if not missing_functions:
                results.append(("Helper Functions", True, "All required helper functions found"))
            else:
                results.append(("Helper Functions", False, f"Missing functions: {missing_functions}"))
            
            # Check for package configurations
            if "CREDIT_PACKAGES" in content and "PREMIUM_PACKAGES" in content:
                results.append(("Package Configurations", True, "Credit and premium packages configured"))
            else:
                results.append(("Package Configurations", False, "Package configurations missing"))
                
        else:
            results.append(("Helpers File", False, "helpers.js not found"))
            
    except Exception as e:
        results.append(("Helper Utilities", False, f"Error: {str(e)}"))
    
    return results

def test_business_logic_completeness():
    """Test business logic implementation completeness"""
    print("💼 Testing Business Logic Completeness...")
    
    results = []
    
    # Test UserService methods
    try:
        user_service_path = "/app/src/services/UserService.js"
        if os.path.exists(user_service_path):
            with open(user_service_path, 'r') as f:
                content = f.read()
            
            required_methods = [
                "checkAndResetDailyTimer",
                "updateDailyTimeUsed",
                "useCredits",
                "purchaseCredits", 
                "upgradeToPremium",
                "getUserStats",
                "updateUserStats"
            ]
            
            missing_methods = []
            for method in required_methods:
                if f"static async {method}" not in content:
                    missing_methods.append(method)
            
            if not missing_methods:
                results.append(("UserService Methods", True, "All required UserService methods implemented"))
            else:
                results.append(("UserService Methods", False, f"Missing methods: {missing_methods}"))
                
    except Exception as e:
        results.append(("UserService Business Logic", False, f"Error: {str(e)}"))
    
    # Test ChatService methods
    try:
        chat_service_path = "/app/src/services/ChatService.js"
        if os.path.exists(chat_service_path):
            with open(chat_service_path, 'r') as f:
                content = f.read()
            
            required_methods = [
                "createChat",
                "sendMessage",
                "endChat",
                "ratePartner",
                "blockUser",
                "reportUser",
                "getChatHistory"
            ]
            
            missing_methods = []
            for method in required_methods:
                if f"static async {method}" not in content:
                    missing_methods.append(method)
            
            if not missing_methods:
                results.append(("ChatService Methods", True, "All required ChatService methods implemented"))
            else:
                results.append(("ChatService Methods", False, f"Missing methods: {missing_methods}"))
                
    except Exception as e:
        results.append(("ChatService Business Logic", False, f"Error: {str(e)}"))
    
    # Test MatchmakingService methods
    try:
        matchmaking_service_path = "/app/src/services/MatchmakingService.js"
        if os.path.exists(matchmaking_service_path):
            with open(matchmaking_service_path, 'r') as f:
                content = f.read()
            
            required_methods = [
                "findPartner",
                "findMatch",
                "getRecentPartners",
                "removeFromQueue",
                "cancelMatching"
            ]
            
            missing_methods = []
            for method in required_methods:
                if f"static async {method}" not in content:
                    missing_methods.append(method)
            
            if not missing_methods:
                results.append(("MatchmakingService Methods", True, "All required MatchmakingService methods implemented"))
            else:
                results.append(("MatchmakingService Methods", False, f"Missing methods: {missing_methods}"))
                
    except Exception as e:
        results.append(("MatchmakingService Business Logic", False, f"Error: {str(e)}"))
    
    return results

def generate_configuration_report(all_results):
    """Generate comprehensive configuration report"""
    print(f"\n{'='*70}")
    print(f"FIREBASE CONFIGURATION & IMPLEMENTATION REPORT")
    print(f"{'='*70}")
    
    total_tests = len(all_results)
    passed_tests = sum(1 for _, success, _ in all_results if success)
    failed_tests = total_tests - passed_tests
    
    print(f"Total Configuration Tests: {total_tests}")
    print(f"Passed: {passed_tests} ✅")
    print(f"Failed: {failed_tests} ❌")
    print(f"Configuration Completeness: {(passed_tests/total_tests*100):.1f}%")
    
    # Group results by category
    categories = {}
    for test_name, success, message in all_results:
        category = test_name.split()[0] if ' ' in test_name else 'General'
        if category not in categories:
            categories[category] = []
        categories[category].append((test_name, success, message))
    
    print(f"\n📋 DETAILED RESULTS BY CATEGORY:")
    for category, tests in categories.items():
        category_passed = sum(1 for _, success, _ in tests if success)
        category_total = len(tests)
        status = "✅" if category_passed == category_total else "⚠️"
        print(f"\n{status} {category.upper()} ({category_passed}/{category_total})")
        
        for test_name, success, message in tests:
            status_icon = "✅" if success else "❌"
            print(f"  {status_icon} {test_name}: {message}")
    
    if failed_tests > 0:
        print(f"\n⚠️ CONFIGURATION ISSUES FOUND:")
        for test_name, success, message in all_results:
            if not success:
                print(f"  ❌ {test_name}: {message}")
    
    return {
        'total_tests': total_tests,
        'passed_tests': passed_tests,
        'failed_tests': failed_tests,
        'completeness_percentage': passed_tests/total_tests*100,
        'categories': categories
    }

def main():
    """Main configuration testing"""
    print("🔥 Firebase Configuration & Implementation Testing")
    print("=" * 70)
    
    all_results = []
    
    # Run all configuration tests
    all_results.extend(test_firebase_configuration())
    all_results.extend(test_package_dependencies())
    all_results.extend(test_service_implementations())
    all_results.extend(test_helper_utilities())
    all_results.extend(test_business_logic_completeness())
    
    # Generate report
    report = generate_configuration_report(all_results)
    
    # Save detailed report
    with open('/app/firebase_config_report.json', 'w') as f:
        json.dump({
            'report': report,
            'detailed_results': [
                {'test': name, 'success': success, 'message': message}
                for name, success, message in all_results
            ],
            'timestamp': '2025-07-22T15:20:00.000000'
        }, f, indent=2)
    
    print(f"\n📊 Configuration report saved to: /app/firebase_config_report.json")
    
    if report['failed_tests'] > 0:
        print(f"\n⚠️ Configuration issues detected. Review the report above.")
        return 1
    else:
        print(f"\n🎉 All configuration tests passed!")
        return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.checkAuth();
    }

    checkAuth() {
        const isAuthenticated = this.isAuthenticated();
        if (isAuthenticated) {
            this.showProtectedContent();
        } else {
            this.showLoginPage();
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    async login(username, password) {
        this.setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (username === 'admin' && password === 'password') {
            this.currentUser = {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin'
            };
            this.setLoading(false);
            this.showProtectedContent();
            return { success: true };
        } else {
            this.setLoading(false);
            return { success: false, error: 'Invalid credentials' };
        }
    }

    logout() {
        this.currentUser = null;
        this.showLoginPage();
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loginBtn = document.getElementById('loginBtn');
        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');

        if (loading) {
            loginBtn.disabled = true;
            loginText.classList.add('hidden');
            loginSpinner.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginText.classList.remove('hidden');
            loginSpinner.classList.add('hidden');
        }
    }

    showLoginPage() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('navbar').classList.remove('show');
        document.getElementById('accessDeniedPage').classList.add('hidden');
        this.hideAllPages();
        this.clearError();
    }

    showProtectedContent() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('navbar').classList.add('show');
        document.getElementById('accessDeniedPage').classList.add('hidden');
        document.getElementById('welcomeText').textContent = `Welcome, ${this.currentUser.username}`;
        this.showPage('home');
    }

    showAccessDenied() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('navbar').classList.remove('show');
        document.getElementById('accessDeniedPage').classList.remove('hidden');
        document.getElementById('deniedUsername').textContent = this.currentUser.username;
        this.hideAllPages();
    }

    hideAllPages() {
        const pages = ['homePage', 'profilePage', 'adminPage'];
        pages.forEach(pageId => {
            document.getElementById(pageId).classList.remove('active');
        });
    }

    showPage(pageName) {
        if (!this.isAuthenticated()) {
            this.showLoginPage();
            return;
        }

        // Check role-based access for admin page
        if (pageName === 'admin' && !this.hasRole('admin')) {
            this.showAccessDenied();
            return;
        }

        this.hideAllPages();
        document.getElementById('accessDeniedPage').classList.add('hidden');
        document.getElementById(pageName + 'Page').classList.add('active');

        // Update nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    clearError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.classList.add('hidden');
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Global functions for UI interaction
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    authManager.clearError();

    if (!username || !password) {
        authManager.showError('Please fill in all fields');
        return;
    }

    const result = await authManager.login(username, password);
    if (!result.success) {
        authManager.showError(result.error);
    }
}

function logout() {
    authManager.logout();
}

function showPage(pageName) {
    authManager.showPage(pageName);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        login();
    }
}

// Protected Route wrapper function
function ProtectedRoute(callback, requiredRole = null) {
    if (!authManager.isAuthenticated()) {
        authManager.showLoginPage();
        return false;
    }

    if (requiredRole && !authManager.hasRole(requiredRole)) {
        authManager.showAccessDenied();
        return false;
    }

    callback();
    return true;
}

// Example usage of ProtectedRoute function
function accessAdminPanel() {
    ProtectedRoute(() => {
        console.log('Accessing admin panel...');
        // Admin panel logic here
    }, 'admin');
}

function accessUserProfile() {
    ProtectedRoute(() => {
        console.log('Accessing user profile...');
        // Profile logic here
    });
}

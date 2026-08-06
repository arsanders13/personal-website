import { supabaseService } from '../supabase.js';
import { store } from '../store.js';

export function initAuthModal() {
  window.addEventListener('open-auth-modal', () => {
    openModal();
  });

  function openModal() {
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();

    const currentUser = supabaseService.currentUser;

    const modalHTML = `
      <div id="auth-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative border-border">
          
          <!-- Close Button -->
          <button id="auth-close-btn" class="btn btn-ghost btn-icon absolute top-4 right-4 text-text-subtle hover:text-text">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          ${currentUser ? `
            <!-- Authenticated Account View -->
            <div class="text-center space-y-4 py-4">
              <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-lg shadow-indigo-500/30">
                ${(currentUser.user_metadata?.full_name || currentUser.email || 'AS').substring(0, 2).toUpperCase()}
              </div>

              <div>
                <h3 class="text-lg font-extrabold text-text">${currentUser.user_metadata?.full_name || 'Account Connected'}</h3>
                <p class="text-xs text-text-subtle font-mono mt-0.5">${currentUser.email}</p>
              </div>

              <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>
                <span>Multi-Device Realtime Cloud Sync Active</span>
              </div>

              <div class="pt-2">
                <button id="auth-signout-btn" class="btn btn-secondary w-full text-xs text-danger border-danger/30 hover:bg-danger/10">
                  <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ` : `
            <!-- Login / Signup Form -->
            <div class="space-y-5">
              <div class="text-center space-y-1">
                <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 font-bold">
                  <i data-lucide="user-check" class="w-5 h-5"></i>
                </div>
                <h3 class="text-lg font-extrabold text-text">Life OS Account</h3>
                <p class="text-xs text-text-subtle">Sign in to sync your tasks, goals, and notes across all your devices.</p>
              </div>

              <!-- Google OAuth Button -->
              <button id="auth-google-btn" class="btn btn-secondary w-full text-xs flex items-center justify-center gap-2 py-2.5">
                <svg class="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div class="flex items-center my-3">
                <div class="flex-1 border-t border-border"></div>
                <span class="px-3 text-[11px] text-text-subtle font-medium">OR EMAIL</span>
                <div class="flex-1 border-t border-border"></div>
              </div>

              <!-- Email/Password Form -->
              <form id="auth-form" class="space-y-3">
                <div id="name-field-group" class="hidden">
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Full Name</label>
                  <input id="auth-name-input" type="text" placeholder="Arianna Sanders" class="input-field text-xs py-2" />
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Email Address</label>
                  <input id="auth-email-input" type="email" placeholder="you@example.com" class="input-field text-xs py-2" required />
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Password</label>
                  <input id="auth-password-input" type="password" placeholder="••••••••" class="input-field text-xs py-2" required />
                </div>

                <div id="auth-error-msg" class="text-xs text-danger hidden font-medium text-center"></div>

                <button type="submit" id="auth-submit-btn" class="btn btn-primary w-full text-xs py-2.5 mt-2">
                  <span>Sign In</span>
                </button>
              </form>

              <div class="text-center pt-2">
                <button id="auth-toggle-mode-btn" class="text-xs text-accent hover:underline font-medium">
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          `}

        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;
    if (window.lucide) window.lucide.createIcons();

    const modal = document.getElementById('auth-modal');
    document.getElementById('auth-close-btn')?.addEventListener('click', () => modal.remove());
    modal?.addEventListener('click', (e) => { if (e.target.id === 'auth-modal') modal.remove(); });

    // Handle Sign Out
    document.getElementById('auth-signout-btn')?.addEventListener('click', async () => {
      await supabaseService.signOut();
      modal.remove();
      store.notify();
    });

    // Handle Google OAuth
    document.getElementById('auth-google-btn')?.addEventListener('click', async () => {
      try {
        await supabaseService.signInWithGoogle();
      } catch (err) {
        const errEl = document.getElementById('auth-error-msg');
        if (errEl) {
          errEl.textContent = err.message || 'Google sign in failed.';
          errEl.classList.remove('hidden');
        }
      }
    });

    // Toggle Sign In / Sign Up mode
    let isSignUpMode = false;
    const toggleBtn = document.getElementById('auth-toggle-mode-btn');
    const submitBtn = document.getElementById('auth-submit-btn');
    const nameGroup = document.getElementById('name-field-group');

    toggleBtn?.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      if (isSignUpMode) {
        nameGroup?.classList.remove('hidden');
        submitBtn.querySelector('span').textContent = 'Create Account';
        toggleBtn.textContent = 'Already have an account? Sign in';
      } else {
        nameGroup?.classList.add('hidden');
        submitBtn.querySelector('span').textContent = 'Sign In';
        toggleBtn.textContent = "Don't have an account? Sign up";
      }
    });

    // Submit Email/Password Form
    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email-input').value.trim();
      const password = document.getElementById('auth-password-input').value;
      const name = document.getElementById('auth-name-input')?.value.trim();
      const errEl = document.getElementById('auth-error-msg');

      try {
        errEl?.classList.add('hidden');
        if (isSignUpMode) {
          await supabaseService.signUpWithEmail(email, password, name);
        } else {
          await supabaseService.signInWithEmail(email, password);
        }
        modal.remove();
        store.notify();
      } catch (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Authentication error.';
          errEl.classList.remove('hidden');
        }
      }
    });
  }
}

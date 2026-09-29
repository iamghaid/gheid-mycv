'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions';

export function LoginForm() {
    const [state, action, pending] = useActionState(loginAction, null);
    return (
        <form action={action} className="mt-6 space-y-4">
            <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="username" required className="input" defaultValue={state?.email} key={state?.email} />
            </div>
            <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
            </div>
            {state && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={pending}>
                {pending ? 'Signing in…' : 'Sign in'}
            </button>
        </form>
    );
}

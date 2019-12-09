export function Logout(context) {
    let history = context.router.history;
    history.push('/login');
}

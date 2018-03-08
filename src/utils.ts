export function tryRun<A>(f: () => A): Promise<A> {
    return new Promise<A>((resolve, reject) => {
        try {
            resolve(f())
        } catch (e) {
            reject(e)
        }
    })
}
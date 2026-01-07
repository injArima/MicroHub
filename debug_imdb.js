
async function run() {
    try {
        const res = await fetch("https://search.imdbot.workers.dev/?tt=tt0903747");
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();

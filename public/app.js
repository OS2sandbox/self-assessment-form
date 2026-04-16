const SCHEMA_PATH = document.currentScript.dataset.schema || 'schema.json';
const DATA_PATH = 'data/evaluation-data.json';
let jedisonInstance = null;

function downloadJson() {
    if (!jedisonInstance) return;
    const data = jedisonInstance.getValue();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluering-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

function checkAllFilled() {
    if (!jedisonInstance) return;
    const data = jedisonInstance.getValue();
    const btn = document.getElementById('download-btn');
    const values = Object.values(data);
    const allFilled = values.every(v => v && v !== '');
    btn.disabled = !allFilled;
}

async function init() {
    try {
        // Fetch schema
        const schemaRes = await fetch(SCHEMA_PATH);
        if (!schemaRes.ok) throw new Error('Failed to load schema');
        const schema = await schemaRes.json();

        // Fetch evaluation data (prefill)
        let initialData = {};
        try {
            const dataRes = await fetch(DATA_PATH);
            if (dataRes.ok) {
                initialData = await dataRes.json();
                console.log('Loaded initial data:', initialData);
            }
        } catch (e) {
            console.log('No initial data found, starting fresh');
        }

        jedisonInstance = new Jedison.Create({
            container: document.getElementById('form'),
            theme: new Jedison.ThemeBootstrap5(),
            schema: schema,
            data: initialData  // Merge: pre-filled values
        });

        jedisonInstance.on('change', () => checkAllFilled());
        checkAllFilled();
    } catch (e) {
        console.error(e);
        document.getElementById('form').innerHTML = '<p class="text-danger">Error: ' + e.message + '</p>';
    }
}

init();
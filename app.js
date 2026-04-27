const SCHEMA_PATH = document.currentScript.dataset.schema || 'schema.json';
const DATA_PATH = 'data/evaluation-data.json';
let jedisonInstance = null;
let downloadBtn, saveBtn;

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

function saveAndOpen() {
    if (!jedisonInstance) return;
    const data = jedisonInstance.getValue();
    const json = JSON.stringify(data, null, 2);
    const org = data.githubOrg || 'OWNER';
    const repo = data.githubRepo || 'REPO';
    
    navigator.clipboard.writeText(json).then(() => {
        window.open(`https://github.com/${org}/${repo}/edit/main/data/evaluation-data.json`, '_blank');
    });
}

function checkAllFilled() {
    if (!jedisonInstance) return;
    const data = jedisonInstance.getValue();
    const allFilled = Object.values(data).every(v => v && v !== '');
    downloadBtn.disabled = !allFilled;
    saveBtn.disabled = !allFilled;
    
    if (!data.dato) {
        jedisonInstance.setValue({ dato: new Date().toLocaleDateString('da-DK') }, 'api');
    }
}

async function init() {
    downloadBtn = document.getElementById('download-btn');
    saveBtn = document.getElementById('save-btn');
    
    try {
        const schemaRes = await fetch(SCHEMA_PATH);
        if (!schemaRes.ok) throw new Error('Failed to load schema');
        const schema = await schemaRes.json();

        let initialData = {};
        try {
            const dataRes = await fetch(DATA_PATH);
            if (dataRes.ok) initialData = await dataRes.json();
        } catch (e) { /* no prefill */ }

        jedisonInstance = new Jedison.Create({
            container: document.getElementById('form'),
            theme: new Jedison.ThemeBootstrap5(),
            schema: schema,
            data: initialData,
            showErrors: 'never'
        });

        jedisonInstance.on('change', checkAllFilled);
        checkAllFilled();
    } catch (e) {
        document.getElementById('form').innerHTML = '<p class="text-danger">Error: ' + e.message + '</p>';
    }
}

init();
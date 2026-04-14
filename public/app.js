const SCHEMA_PATH = document.currentScript.dataset.schema || 'schema.json';

async function init() {
    try {
        const response = await fetch(SCHEMA_PATH);
        if (!response.ok) throw new Error('Failed to load schema');
        const schema = await response.json();

        new Jedison.Create({
            container: document.getElementById('form'),
            theme: new Jedison.Theme(),
            schema: schema
        });
    } catch (e) {
        console.error(e);
        document.getElementById('form').innerHTML = '<p style="color:red">Error: ' + e.message + '</p>';
    }
}

init();
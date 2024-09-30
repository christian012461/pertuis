document.getElementById('connectBtn').addEventListener('click', async () => {
    try {
        // Demander à l'utilisateur de sélectionner un périphérique Bluetooth avec un UUID spécifique
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['0bd62591-0b10-431a-982e-bd136821f35b'] }]  // UUID du service de l'ESP32
        });

        // Connexion au périphérique Bluetooth
        const server = await device.gatt.connect();

        // Obtenir le service avec les caractéristiques de température et pression
        const service = await server.getPrimaryService('0bd62591-0b10-431a-982e-bd136821f35b'); // UUID du service

        // Obtenir la caractéristique de température
        const temperatureCharacteristic = await service.getCharacteristic('0bd62592-0b10-431a-982e-bd136821f35b'); // UUID de la température

        // Obtenir la caractéristique de pression
        const pressureCharacteristic = await service.getCharacteristic('0bd62594-0b10-431a-982e-bd136821f35b'); // UUID de la pression

        // Lire les valeurs initiales et les afficher
        await readAndDisplayValues(temperatureCharacteristic, pressureCharacteristic);

        // Configurer des notifications pour mettre à jour les valeurs en temps réel
        temperatureCharacteristic.startNotifications();
        pressureCharacteristic.startNotifications();

        temperatureCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
            const temperature = parseFloat(decodeValue(event.target.value));
            document.getElementById('temperature').textContent = temperature.toFixed(2);
        });

        pressureCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
            const pressure = parseFloat(decodeValue(event.target.value));
            document.getElementById('pressure').textContent = pressure.toFixed(2);
        });

    } catch (error) {
        console.log('Erreur lors de la connexion Bluetooth :', error);
    }
});

async function readAndDisplayValues(temperatureCharacteristic, pressureCharacteristic) {
    // Lire la température
    const tempValue = await temperatureCharacteristic.readValue();
    const temperature = parseFloat(decodeValue(tempValue));
    document.getElementById('temperature').textContent = temperature.toFixed(2);

    // Lire la pression
    const pressureValue = await pressureCharacteristic.readValue();
    const pressure = parseFloat(decodeValue(pressureValue));
    document.getElementById('pressure').textContent = pressure.toFixed(2);
}

function decodeValue(value) {
    // Décoder la valeur reçue (Uint8Array) en chaîne de caractères
    let decoder = new TextDecoder('utf-8');
    return decoder.decode(value);
}

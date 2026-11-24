import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import ga4 from '../config/ga4/ga4.json' with { type: 'json' };
import { initializeAnalytics } from './analytics.mjs';
import { createMotorConfigurado } from './composables/useMotor.js';

initializeAnalytics(ga4);
try {
    const { motor, config } = createMotorConfigurado();
    // A read-only diagnostic identifies the same configured instance tested in Node.
    window.QuizEngine = motor;
    createApp(App).provide('motor', motor).provide('config', config).mount('#app');
} catch (error) {
    window.coletaHabilitada = false;
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'Não foi possível carregar o quiz. Tente novamente em instantes.';
    document.getElementById('app').replaceChildren(message);
    console.error('Não foi possível inicializar o quiz:', error.message);
}

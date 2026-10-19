import '@fontsource/shrikhand';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') as HTMLElement });

import { createApp } from './app';
import { config } from './config';
import { seedDemoData } from './data/seed';

seedDemoData();

createApp().listen(config.port, () => {
  console.log(`Lohkokirja käynnissä: http://localhost:${config.port}`);
});

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FirebaseLoginStory } from '../../tests/FirebaseLogin.story.tsx';

import '../../playwright';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseLoginStory />
  </StrictMode>,
);

import { createApp } from 'vue'
import './style.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import {
  faBars,
  faArrowLeft,
  faList,
  faGear,
  faTriangleExclamation,
  faExpand,
  faTerminal,
  faArrowRotateLeft,
} from '@fortawesome/free-solid-svg-icons'

import {
  faLightbulb,
  faCircleQuestion,
  faCircleRight,
} from '@fortawesome/free-regular-svg-icons'
import App from './App.vue'

/* add icons to the library */
library.add(
  faBars,
  faArrowLeft,
  faTriangleExclamation,
  faGear,
  faExpand,
  faList,
  faLightbulb,
  faCircleQuestion,
  faArrowRotateLeft,
  faCircleRight,
  faTerminal
)

createApp(App).component('font-awesome-icon', FontAwesomeIcon).mount('#app')

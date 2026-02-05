import {setupMessagingHandler} from './background/messaging.js';
import { setupLifecycleHandler } from './background/lifecycle.js';

// Initialize messaging handler
setupMessagingHandler();

// Initialize lifecycle handler
setupLifecycleHandler();
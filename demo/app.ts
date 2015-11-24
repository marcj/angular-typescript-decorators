import {registerControllerDecorator} from '../angular-decorators.ts';
registerControllerDecorator();

// each directive and filter need to be loaded like this:
import './directives/SuperDirective.ts';
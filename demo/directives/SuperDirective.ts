import {Directive} from '../../angular-decorators.ts';

@Directive('superDirective', {
    restrict: 'E',
    scope: true,
    template: '<b>super directive</b><br/>Current Time: {{time}}'
})
export default class SuperDirective {
    protected scope;

    constructor(protected $timeout) {
    }

    link(scope, element, attribtues) {
        this.scope = scope;
        this.setTime();
    }

    setTime() {
        this.scope.time = new Date();
        this.$timeout(() => this.setTime(), 1000);
    }
}
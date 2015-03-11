(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackTitle', trackTitleDirective);

    function trackTitleDirective($timeout) {
        return {
            restrict: 'EA',
            transclude: true,
            template: '<div class="moving-title" ng-transclude></div>',
            link: function($scope, element, attrs) {

                var animateEl, textEl, textCloneEl, elementWidth, textWidth, animating, margin;

                element.on('mouseover', function(e) {
                    if (animating) {
                        return;
                    }

                    animateEl = element[0].querySelector('.moving-title');
                    textEl = animateEl.querySelector('span');
                    elementWidth = animateEl.offsetWidth;
                    textWidth = textEl.offsetWidth;
                    animating = false;
                    margin = 0;

                    if (textWidth > elementWidth) {
                        animating = true;
                        textEl.style.marginRight = '10px';
                        textWidth += 10;
                        textCloneEl = textEl.cloneNode(true);
                        animateEl.appendChild(textCloneEl);
                        animate();
                    }
                });

                function animate() {
                    if (margin < textWidth) {
                        $timeout(animate, 30);
                        element[0].style.marginLeft = -margin + 'px';
                        margin ++;
                    } else {
                        animating = false;
                        textCloneEl.remove();
                        element[0].style.marginLeft = 0;
                    }
                }
            }
        };
    }
}());

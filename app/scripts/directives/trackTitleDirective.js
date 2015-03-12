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

                attrs.$observe('trackTitle', function(val) {
                    if (animating) {
                        clearAnimation();
                    }
                });

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

                function clearAnimation() {
                    animating = false;
                    textCloneEl.remove();
                    element[0].style.marginLeft = 0;
                }

                function animate() {
                    if (animating && margin < textWidth) {
                        $timeout(animate, 30);
                        element[0].style.marginLeft = -margin + 'px';
                        margin ++;
                    } else {
                        clearAnimation();
                    }
                }
            }
        };
    }
}());

import { TRANSITION_DIRECTION_KEY } from '@utils/localStorage';
import { removeTrailingSlash } from '@i18n/utils';
import { techSkills } from '@content/techSkills';

export const setTransitionDirection = () => {
  if ('CSSViewTransitionRule' in window) {
    window.addEventListener('pageswap', async (e: PageSwapEvent) => {
      if (e.viewTransition) {
        const currentURL = e.activation.from?.url
          ? new URL(e.activation.from?.url)
          : null;
        const targetURL = new URL(e.activation.entry.url);

        let transitionType: 'reload' | 'forwards' | 'backwards';

        if (!currentURL) {
          transitionType = 'reload';
          e.viewTransition.types.add(transitionType);
          sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
          return;
        }
        const currentPathname = removeTrailingSlash(currentURL.pathname);
        const destinationPathname = removeTrailingSlash(targetURL.pathname);

        const nextSkill = techSkills.find(
          (skill) => skill.href === destinationPathname.split('/').pop()
        );
        const thisSkill = techSkills.find(
          (skill) => skill.href === currentPathname.split('/').pop()
        );

        if (
          currentPathname === destinationPathname ||
          !nextSkill ||
          !thisSkill
        ) {
          transitionType = 'reload';
          e.viewTransition.types.add(transitionType);
          sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
          return;
        }

        if (nextSkill && thisSkill) {
          const thisSkillIndex = techSkills.indexOf(thisSkill);
          const nextSkillIndex = techSkills.indexOf(nextSkill);
          if (
            thisSkillIndex - nextSkillIndex === 1 ||
            (thisSkillIndex === 0 && nextSkillIndex === techSkills.length - 1)
          ) {
            transitionType = 'backwards';
            e.viewTransition.types.add(transitionType);
            sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
            e.viewTransition.types.add(transitionType);
            return;
          }
          if (
            thisSkillIndex - nextSkillIndex === -1 ||
            (thisSkillIndex === techSkills.length - 1 && nextSkillIndex === 0)
          ) {
            transitionType = 'forwards';
            e.viewTransition.types.add(transitionType);
            sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
            e.viewTransition.types.add(transitionType);
            return;
          }
          if (
            thisSkillIndex > nextSkillIndex ||
            (thisSkillIndex === 1 && nextSkillIndex === techSkills.length - 1)
          ) {
            transitionType = 'backwards';
            e.viewTransition.types.add(transitionType);
            sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
            e.viewTransition.types.add(transitionType);
            return;
          }
          if (
            thisSkillIndex < nextSkillIndex ||
            (thisSkillIndex === techSkills.length - 2 && nextSkillIndex === 0)
          ) {
            transitionType = 'forwards';
            e.viewTransition.types.add(transitionType);
            sessionStorage[TRANSITION_DIRECTION_KEY] = transitionType;
            e.viewTransition.types.add(transitionType);
            return;
          }
        }
      }
    });
  }
};

// add inline script

// <script is:inline>
//   window.addEventListener('pagereveal', async (e) => {
//     if (e.viewTransition) {
//       const transitionType = sessionStorage['transition-direction'];
//       e.viewTransition.types.add(transitionType);
//       sessionStorage.removeItem('transition-direction');
//     }
//   });
// </script>

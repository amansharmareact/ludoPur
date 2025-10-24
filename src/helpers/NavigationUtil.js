// helpers/NavigationUtil.js
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/**
 * Ensures the navigationRef is ready before executing navigation actions.
 */
async function waitForNavigationReady(timeout = 5000) {
  const start = Date.now();
  while (!navigationRef.isReady() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Navigate to a specific route
 */
export async function navigate(routeName, params) {
  await waitForNavigationReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate(routeName, params));
  } else {
    console.warn('Navigation not ready for navigate()');
  }
}

/**
 * Reset the navigation stack and go to a specific screen
 */
export async function resetAndNavigate(routeName) {
  await waitForNavigationReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      }),
    );
    console.log(`✅ resetAndNavigate → ${routeName}`);
  } else {
    console.warn('Navigation not ready for resetAndNavigate()');
  }
}

/**
 * Go back to the previous screen
 */
export async function goBack() {
  await waitForNavigationReady();
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

/**
 * Push a new screen onto the stack
 */
export async function push(routeName, params) {
  await waitForNavigationReady();
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.navigate({ name: routeName, params }));
  }
}

/**
 * Optional helper (can be called on app init)
 */
export async function prepareNavigation() {
  await waitForNavigationReady();
}

import { agua } from '../agua.js';
import { parseViewComponentName } from './viewComponentNameParser.js';

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

export async function loadViewComponent(relativePath, containerElement) {
    if (relativePath.indexOf('?') >= 0) {
        relativePath = relativePath.substring(0, relativePath.indexOf('?'));
    }
    const template = await agua.getTemplate(`${relativePath}.html`);
    removeAllChildNodes(containerElement);
    const newView = document.createElement('div');
    newView.innerHTML = template;
    containerElement.appendChild(newView);
    const viewModelScriptId = 'view-model-script';
    let viewModelScript = document.getElementById(viewModelScriptId);
    if (viewModelScript) {
        viewModelScript.remove();
    }
    viewModelScript = document.createElement('script');
    viewModelScript.setAttribute('id', viewModelScriptId);
    viewModelScript.setAttribute('type', 'module');
    viewModelScript.setAttribute('src', `app/view/${relativePath}.js?t=${Date.now()}`);
    document.body.appendChild(viewModelScript);
}

export function findViewComponents(rootElement = null) {
    const root = rootElement || document;
    return root.querySelectorAll('[data-load-view-component]');
}

export function loadDataViewComponents(rootElement = null, callback) {
    const viewComponents = findViewComponents(rootElement);
    viewComponents.forEach(async (element) => {
        const viewComponentName = element.dataset.loadViewComponent;
        const viewComponent = parseViewComponentName(viewComponentName);
        await loadViewComponent(viewComponent.relativePath, element);
        callback(element);
    });
}
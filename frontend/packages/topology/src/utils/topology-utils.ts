import * as _ from 'lodash';
import GitUrlParse from 'git-url-parse';
import i18next from 'i18next';
import {
  K8sResourceKind,
  K8sResourceKindReference,
  modelFor,
  referenceFor,
  RouteKind,
} from '@console/internal/module/k8s';
import { RootState } from '@console/internal/redux';
import { getRouteWebURL } from '@console/internal/components/routes';
import { Node, Edge, GraphElement } from '@patternfly/react-topology';
import { ALLOW_SERVICE_BINDING_FLAG } from '../const';
import { updateResourceApplication } from './application-utils';
import { createResourceConnection, removeResourceConnection } from './connector-utils';
import { TopologyDataObject } from '../topology-types';
import { TYPE_OPERATOR_BACKED_SERVICE } from '../operators/components/const';
import OdcBaseNode from '../elements/OdcBaseNode';

export const WORKLOAD_TYPES = [
  'deployments',
  'deploymentConfigs',
  'daemonSets',
  'statefulSets',
  'jobs',
  'cronJobs',
  'pods',
];

export type CheDecoratorData = {
  cheURL?: string;
  cheIconURL?: string;
};

export const getServiceBindingStatus = ({ FLAGS }: RootState): boolean =>
  FLAGS.get(ALLOW_SERVICE_BINDING_FLAG);

export const getCheDecoratorData = (consoleLinks: K8sResourceKind[]): CheDecoratorData => {
  const cheConsoleLink = _.find(consoleLinks, ['metadata.name', 'che']);
  return {
    cheURL: cheConsoleLink?.spec?.href,
    cheIconURL: cheConsoleLink?.spec?.applicationMenu?.imageURL,
  };
};

export const getEditURL = (vcsURI?: string, gitBranch?: string, cheURL?: string) => {
  if (!vcsURI) {
    return null;
  }
  const parsedURL = GitUrlParse(vcsURI);
  const gitURL = `https://${parsedURL.source}/${parsedURL.owner}/${parsedURL.name}`;
  const fullGitURL = gitBranch ? `${gitURL}/tree/${gitBranch}` : gitURL;
  return cheURL ? `${cheURL}/f?url=${fullGitURL}&policies.create=peruser` : fullGitURL;
};

export const getNamespaceDashboardKialiLink = (
  consoleLinks: K8sResourceKind[],
  namespace: string,
): string => {
  const kialiLink = _.find(consoleLinks, ['metadata.name', `kiali-namespace-${namespace}`])?.spec
    ?.href;
  return kialiLink || '';
};

/**
 * filter data based on the active application
 */
export const filterBasedOnActiveApplication = (
  data: K8sResourceKind[],
  application: string,
): K8sResourceKind[] => {
  const PART_OF = 'app.kubernetes.io/part-of';
  if (!application) {
    return data;
  }
  return data.filter((dc) => {
    return _.get(dc, ['metadata', 'labels', PART_OF]) === application;
  });
};

/**
 * get routes url
 */
export const getRoutesURL = (resource: K8sResourceKind, routes: RouteKind[]): string => {
  if (routes.length > 0 && !_.isEmpty(routes[0].spec)) {
    return getRouteWebURL(routes[0]);
  }
  return null;
};

export const getTopologyResourceObject = (topologyObject: TopologyDataObject): K8sResourceKind => {
  if (!topologyObject) {
    return null;
  }
  return topologyObject.resource || topologyObject.resources?.obj;
};

export const getResource = (node: Node): K8sResourceKind => {
  const resource = (node as OdcBaseNode)?.getResource();
  return resource || getTopologyResourceObject(node?.getData());
};

export const getResourceKind = (node: Node): K8sResourceKindReference => {
  return node instanceof OdcBaseNode
    ? (node as OdcBaseNode).getResourceKind()
    : referenceFor(getTopologyResourceObject(node?.getData()));
};

export const updateTopologyResourceApplication = (
  item: Node,
  application: string,
): Promise<any> => {
  const itemData = item?.getData();
  const resource = getResource(item);
  if (!item || !resource || !_.size(itemData.resources)) {
    return Promise.reject();
  }

  const resources: K8sResourceKind[] = [];
  const updates: Promise<any>[] = [];

  resources.push(resource);

  if (item.getType() === TYPE_OPERATOR_BACKED_SERVICE) {
    _.forEach(itemData.groupResources, (groupResource) => {
      resources.push(groupResource.resource);
    });
  }

  for (const nextResource of resources) {
    const resourceKind = modelFor(referenceFor(nextResource));
    if (!resourceKind) {
      return Promise.reject(
        new Error(
          i18next.t('topology~Unable to update Application, invalid resource type: {{kind}}', {
            kind: nextResource.kind,
          }),
        ),
      );
    }
    updates.push(updateResourceApplication(resourceKind, nextResource, application));
  }

  return Promise.all(updates);
};

export const createTopologyResourceConnection = (
  source: K8sResourceKind,
  target: K8sResourceKind,
  replaceTarget: K8sResourceKind = null,
): Promise<K8sResourceKind[] | K8sResourceKind> => {
  if (!source || !target || source === target) {
    return Promise.reject(
      new Error(i18next.t('topology~Can not create a connection from a node to itself.')),
    );
  }

  return createResourceConnection(source, target, replaceTarget);
};

export const removeTopologyResourceConnection = (edge: Edge): Promise<any> => {
  const source = getResource(edge.getSource());
  const target = getResource(edge.getTarget());

  if (!source || !target) {
    return Promise.reject();
  }

  return removeResourceConnection(source, target);
};

export const isOperatorBackedNode = (element: Node | GraphElement): boolean => {
  if (element?.getData()?.resources?.isOperatorBackedService) {
    return true;
  }
  return element?.hasParent() ? isOperatorBackedNode(element.getParent()) : false;
};

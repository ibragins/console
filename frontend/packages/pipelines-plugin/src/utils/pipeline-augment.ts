import { TFunction } from 'i18next';
import {
  chart_color_green_400 as successColor,
  chart_color_blue_300 as runningColor,
  global_danger_color_100 as failureColor,
  chart_color_blue_100 as pendingColor,
  chart_color_black_400 as skippedColor,
  chart_color_black_500 as cancelledColor,
} from '@patternfly/react-tokens';
import {
  K8sKind,
  K8sResourceKind,
  PersistentVolumeClaimKind,
  referenceForModel,
  GroupVersionKind,
  apiVersionForModel,
  ObjectMetadata,
} from '@console/internal/module/k8s';
import {
  ClusterTaskModel,
  ClusterTriggerBindingModel,
  PipelineRunModel,
  TaskModel,
  TriggerBindingModel,
  PipelineModel,
} from '../models';
import { pipelineRunFilterReducer } from './pipeline-filter-reducer';
import { TektonResourceLabel } from '../components/pipelines/const';

interface Metadata {
  name: string;
  namespace?: string;
}

export interface PropPipelineData {
  metadata: Metadata;
  latestRun?: PipelineRun;
}

interface StatusMessage {
  message: string;
  pftoken: { name: string; value: string; var: string };
}

export interface TaskStatus {
  PipelineNotStarted: number;
  Pending: number;
  Running: number;
  Succeeded: number;
  Cancelled: number;
  Failed: number;
  Skipped: number;
}

export interface PipelineTaskRef {
  kind?: string;
  name: string;
}

export interface PipelineTaskSpec {
  steps: {
    name: string;
    image?: string;
    args?: string[];
    script?: string[];
  }[];
  metadata?: {
    labels?: { [key: string]: string };
  };
}

export interface PipelineTaskParam {
  name: string;
  value: any;
}
export interface PipelineTaskResources {
  inputs?: PipelineTaskResource[];
  outputs?: PipelineTaskResource[];
}
export interface PipelineTaskResource {
  name: string;
  resource?: string;
  from?: string[];
}
export interface WhenExpression {
  Input: string;
  Operator: string;
  Values: string[];
}
export interface PipelineTask {
  name: string;
  runAfter?: string[];
  taskRef?: PipelineTaskRef;
  taskSpec?: PipelineTaskSpec;
  params?: PipelineTaskParam[];
  resources?: PipelineTaskResources;
  workspaces?: PipelineTaskWorkspace[];
  when?: WhenExpression[];
}
export interface PipelineTaskWorkspace {
  name: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
  workspace?: string;
}
export interface Resource {
  propsReferenceForRuns: string[];
  resources: FirehoseResource[];
}

export interface PipelineResource {
  name: string;
  type: string;
}

type PipelineRunResourceCommonProperties = {
  name: string;
};
export type PipelineRunInlineResourceParam = { name: string; value: string };
export type PipelineRunInlineResource = PipelineRunResourceCommonProperties & {
  resourceSpec: {
    params: PipelineRunInlineResourceParam[];
    type: string;
  };
};
export type PipelineRunReferenceResource = PipelineRunResourceCommonProperties & {
  resourceRef: {
    name: string;
  };
};
export type PipelineRunResource = PipelineRunReferenceResource | PipelineRunInlineResource;

export type PipelineWorkspace = Param;

export interface Runs {
  data?: PipelineRun[];
}

export type KeyedRuns = { [key: string]: Runs };
export interface PipelineSpec {
  params?: PipelineParam[];
  resources?: PipelineResource[];
  workspaces?: PipelineWorkspace[];
  tasks: PipelineTask[];
  serviceAccountName?: string;
}
export interface Pipeline extends K8sResourceKind {
  latestRun?: PipelineRun;
  spec: PipelineSpec;
}

export type TaskRunWorkspace = {
  name: string;
  volumeClaimTemplate?: PersistentVolumeClaimKind;
  persistentVolumeClaim?: VolumeTypePVC;
  configMap?: VolumeTypeConfigMaps;
  emptyDir?: {};
  secret?: VolumeTypeSecret;
  subPath?: string;
};

export type TaskRunStatus = {
  completionTime?: string;
  conditions?: Condition[];
  podName?: string;
  startTime?: string;
  steps?: PLRTaskRunStep[];
};

export interface TaskRunKind extends K8sResourceKind {
  spec: {
    taskRef?: PipelineTaskRef;
    taskSpec?: PipelineTaskSpec;
    serviceAccountName?: string;
    params?: PipelineTaskParam[];
    resources?: PipelineResource[];
    timeout?: string;
    workspaces?: TaskRunWorkspace[];
  };
  status?: TaskRunStatus;
}

export type PLRTaskRunStep = {
  container: string;
  imageID: string;
  name: string;
  terminated?: {
    containerID: string;
    exitCode: number;
    finishedAt: string;
    reason: string;
    startedAt: string;
  };
};

export type PLRTaskRunData = {
  pipelineTaskName: string;
  status: {
    completionTime?: string;
    conditions: Condition[];
    /** Can be empty */
    podName: string;
    startTime: string;
    steps?: PLRTaskRunStep[];
  };
};

export type PLRTaskRuns = {
  [taskRunName: string]: PLRTaskRunData;
};

export interface PipelineRun extends K8sResourceKind {
  spec?: {
    pipelineRef?: { name: string };
    pipelineSpec?: PipelineSpec;
    params?: PipelineRunParam[];
    workspaces?: PipelineRunWorkspace[];
    resources?: PipelineRunResource[];
    serviceAccountName?: string;
    // Odd status value that only appears in a single case - cancelling a pipeline
    status?: 'PipelineRunCancelled';
    timeout?: string;
  };
  status?: {
    succeededCondition?: string;
    creationTimestamp?: string;
    conditions?: Condition[];
    startTime?: string;
    completionTime?: string;
    taskRuns?: PLRTaskRuns;
    pipelineSpec: PipelineSpec;
    skippedTasks?: {
      name: string;
    }[];
  };
}

export type PipelineResourceKind = K8sResourceKind & {
  spec: {
    params: { name: string; value: string }[];
    type: string;
  };
};

export interface PipelineResourceTaskParam extends PipelineParam {
  type: string;
}
export interface PipelineResourceTaskResource {
  name: string;
  type: string;
  optional?: boolean;
}
export interface PipelineResourceTask extends K8sResourceKind {
  spec: {
    params?: PipelineResourceTaskParam[];
    resources?: {
      inputs?: PipelineResourceTaskResource[];
      outputs?: PipelineResourceTaskResource[];
    };

    steps: {
      // TODO: Figure out required fields
      args?: string[];
      command?: string[];
      image?: string;
      resources?: {}[];
    }[];
  };
}

export interface Condition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
}

export interface Param {
  name: string;
}

export interface PipelineParam extends Param {
  type?: string | string[];
  default?: string | string[];
  description?: string;
}

export interface PipelineRunParam extends Param {
  value: string | string[];
  input?: string;
  output?: string;
  resource?: object;
}

export type VolumeTypeSecret = {
  secretName: string;
  items?: {
    key: string;
    path: string;
  }[];
};

export type VolumeTypeConfigMaps = {
  name: string;
  items?: {
    key: string;
    path: string;
  }[];
};

export type VolumeTypePVC = {
  claimName: string;
};

export type PersistentVolumeClaimType = {
  persistentVolumeClaim: VolumeTypePVC;
};

export type VolumeClaimTemplateType = {
  volumeClaimTemplate: VolumeTypeClaim;
};
export type VolumeTypeClaim = {
  metadata: ObjectMetadata;
  spec: {
    accessModes: string[];
    resources: {
      requests: {
        storage: string;
      };
    };
  };
};

export interface PipelineRunWorkspace extends Param {
  [volumeType: string]:
    | VolumeTypeSecret
    | VolumeTypeConfigMaps
    | VolumeTypePVC
    | VolumeTypeClaim
    | {};
}

interface FirehoseResource {
  kind: string;
  namespace?: string;
  isList?: boolean;
  selector?: object;
}

export const getResources = (data: PropPipelineData[]): Resource => {
  const resources = [];
  const propsReferenceForRuns = [];
  if (data && data.length > 0) {
    data.forEach((pipeline, i) => {
      if (pipeline.metadata && pipeline.metadata.namespace && pipeline.metadata.name) {
        propsReferenceForRuns.push(`PipelineRun_${i}`);
        resources.push({
          kind: referenceForModel(PipelineRunModel),
          namespace: pipeline.metadata.namespace,
          isList: true,
          prop: `PipelineRun_${i}`,
          selector: {
            'tekton.dev/pipeline': pipeline.metadata.name,
          },
        });
      }
    });
    return { propsReferenceForRuns, resources };
  }
  return { propsReferenceForRuns: null, resources: null };
};

export const getLatestRun = (runs: Runs, field: string): PipelineRun => {
  if (!runs || !runs.data || !(runs.data.length > 0) || !field) {
    return null;
  }
  let latestRun = runs.data[0];
  if (field === 'creationTimestamp') {
    for (let i = 1; i < runs.data.length; i++) {
      latestRun =
        runs.data[i] &&
        runs.data[i].metadata &&
        runs.data[i].metadata[field] &&
        new Date(runs.data[i].metadata[field]) > new Date(latestRun.metadata[field])
          ? runs.data[i]
          : latestRun;
    }
  } else if (field === 'startTime' || field === 'completionTime') {
    for (let i = 1; i < runs.data.length; i++) {
      latestRun =
        runs.data[i] &&
        runs.data[i].status &&
        runs.data[i].status[field] &&
        new Date(runs.data[i].status[field]) > new Date(latestRun.status[field])
          ? runs.data[i]
          : latestRun;
    }
  } else {
    latestRun = runs.data[runs.data.length - 1];
  }
  if (!latestRun.status) {
    latestRun = { ...latestRun, status: { pipelineSpec: { tasks: [] } } };
  }
  if (!latestRun.status.succeededCondition) {
    latestRun.status = { ...latestRun.status, succeededCondition: '' };
  }
  latestRun.status.succeededCondition = pipelineRunFilterReducer(latestRun);
  return latestRun;
};

export const augmentRunsToData = (
  data: PropPipelineData[],
  propsReferenceForRuns: string[],
  runs: { [key: string]: Runs },
): PropPipelineData[] => {
  if (propsReferenceForRuns) {
    const newData: PropPipelineData[] = [];
    propsReferenceForRuns.forEach((reference, i) => {
      const latestRun = getLatestRun(runs[reference], 'creationTimestamp');
      if (latestRun !== data[i].latestRun) {
        // ensure we create a new data object if the latestRun has changed so that shallow compare fails
        newData.push({ ...data[i], latestRun });
      } else {
        newData.push(data[i]);
      }
    });
    return newData;
  }
  return data;
};

export enum runStatus {
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Running = 'Running',
  'In Progress' = 'In Progress',
  FailedToStart = 'FailedToStart',
  PipelineNotStarted = 'PipelineNotStarted',
  Skipped = 'Skipped',
  Cancelled = 'Cancelled',
  Pending = 'Pending',
  Idle = 'Idle',
}

export const getRunStatusColor = (status: string, t: TFunction): StatusMessage => {
  switch (status) {
    case runStatus.Succeeded:
      return { message: t('pipelines-plugin~Succeeded'), pftoken: successColor };
    case runStatus.Failed:
      return { message: t('pipelines-plugin~Failed'), pftoken: failureColor };
    case runStatus.FailedToStart:
      return {
        message: t('pipelines-plugin~PipelineRun failed to start'),
        pftoken: failureColor,
      };
    case runStatus.Running:
      return { message: t('pipelines-plugin~Running'), pftoken: runningColor };
    case runStatus['In Progress']:
      return { message: t('pipelines-plugin~Running'), pftoken: runningColor };

    case runStatus.Skipped:
      return { message: t('pipelines-plugin~Skipped'), pftoken: skippedColor };
    case runStatus.Cancelled:
      return { message: t('pipelines-plugin~Cancelled'), pftoken: cancelledColor };
    case runStatus.Idle:
    case runStatus.Pending:
      return { message: t('pipelines-plugin~Pending'), pftoken: pendingColor };
    default:
      return { message: t('pipelines-plugin~PipelineRun not started yet'), pftoken: pendingColor };
  }
};

export const truncateName = (name: string, length: number): string =>
  name.length < length ? name : `${name.slice(0, length - 1)}...`;

export const getPipelineFromPipelineRun = (pipelineRun: PipelineRun): Pipeline => {
  const pipelineName = pipelineRun?.metadata?.labels?.[TektonResourceLabel.pipeline];
  if (!pipelineName || !pipelineRun?.status?.pipelineSpec) {
    return null;
  }
  return {
    apiVersion: apiVersionForModel(PipelineModel),
    kind: PipelineModel.kind,
    metadata: {
      name: pipelineName,
      namespace: pipelineRun.metadata.namespace,
    },
    spec: pipelineRun?.status?.pipelineSpec,
  };
};

export const getTaskStatus = (pipelinerun: PipelineRun): TaskStatus => {
  const executedPipeline = getPipelineFromPipelineRun(pipelinerun);
  const totalTasks = (executedPipeline?.spec?.tasks || []).length ?? 0;
  const plrTasks =
    pipelinerun && pipelinerun.status && pipelinerun.status.taskRuns
      ? Object.keys(pipelinerun.status.taskRuns)
      : [];
  const plrTaskLength = plrTasks.length;
  const skippedTaskLength = (pipelinerun?.status?.skippedTasks || []).length;
  const taskStatus: TaskStatus = {
    PipelineNotStarted: 0,
    Pending: 0,
    Running: 0,
    Succeeded: 0,
    Failed: 0,
    Cancelled: 0,
    Skipped: skippedTaskLength,
  };
  if (pipelinerun && pipelinerun.status && pipelinerun.status.taskRuns) {
    plrTasks.forEach((taskRun) => {
      const status = pipelineRunFilterReducer(pipelinerun.status.taskRuns[taskRun]);
      if (status === 'Succeeded' || status === 'Completed' || status === 'Complete') {
        taskStatus[runStatus.Succeeded]++;
      } else if (status === 'Running') {
        taskStatus[runStatus.Running]++;
      } else if (status === 'Failed') {
        taskStatus[runStatus.Failed]++;
      } else if (status === 'Cancelled') {
        taskStatus[runStatus.Cancelled]++;
      } else {
        taskStatus[runStatus.Pending]++;
      }
    });

    const pipelineRunHasFailure = taskStatus[runStatus.Failed] > 0;
    const pipelineRunIsCancelled = pipelineRunFilterReducer(pipelinerun) === runStatus.Cancelled;
    const unhandledTasks =
      totalTasks >= plrTaskLength ? totalTasks - plrTaskLength - skippedTaskLength : totalTasks;

    if (pipelineRunHasFailure || pipelineRunIsCancelled) {
      taskStatus[runStatus.Cancelled] += unhandledTasks;
    } else {
      taskStatus[runStatus.Pending] += unhandledTasks;
    }
  } else if (
    pipelinerun &&
    pipelinerun.status &&
    pipelinerun.status.conditions &&
    pipelinerun.status.conditions[0].status === 'False'
  ) {
    taskStatus[runStatus.Cancelled] = totalTasks;
  } else {
    taskStatus[runStatus.PipelineNotStarted]++;
  }
  return taskStatus;
};

export const getResourceModelFromTaskKind = (kind: string): K8sKind =>
  kind === ClusterTaskModel.kind ? ClusterTaskModel : TaskModel;

export const getResourceModelFromBindingKind = (kind: string): K8sKind =>
  kind === ClusterTriggerBindingModel.kind ? ClusterTriggerBindingModel : TriggerBindingModel;

export const getResourceModelFromTask = (task: PipelineTask): K8sKind => {
  const {
    taskRef: { kind },
  } = task;

  return getResourceModelFromTaskKind(kind);
};

export const pipelineRefExists = (pipelineRun: PipelineRun): boolean =>
  !!pipelineRun.spec.pipelineRef?.name;

export const getModelReferenceFromTaskKind = (kind: string): GroupVersionKind => {
  const model = getResourceModelFromTaskKind(kind);
  return referenceForModel(model);
};

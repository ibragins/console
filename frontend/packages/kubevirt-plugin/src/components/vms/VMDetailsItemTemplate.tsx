import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateModel } from '@console/internal/models';
import { TemplateKind } from '@console/internal/module/k8s';
import {
  useK8sWatchResource,
  WatchK8sResource,
} from '@console/internal/components/utils/k8s-watch-hook';
import { getBasicID, prefixedID } from '../../utils';
import { VMTemplateLink } from '../vm-templates/vm-template-link';
import VMDetailsItem from './VMDetailsItem';

const VMDetailsItemTemplate: React.FC<VMDetailsItemTemplateProps> = ({ name, namespace }) => {
  const { t } = useTranslation();
  const templatesResource: WatchK8sResource = {
    isList: false,
    kind: TemplateModel.kind,
    name,
    namespace,
  };
  const [template, loadedTemplates, errorTemplates] = useK8sWatchResource<TemplateKind>(
    templatesResource,
  );
  const id = getBasicID(template);

  return (
    <VMDetailsItem
      title={t('kubevirt-plugin~Template')}
      idValue={prefixedID(id, 'template')}
      isLoading={!loadedTemplates}
      isNotAvail={!name || !namespace || (loadedTemplates && !template) || errorTemplates}
    >
      <VMTemplateLink name={name} namespace={namespace} />
    </VMDetailsItem>
  );
};

export type VMDetailsItemTemplateProps = {
  name: string;
  namespace: string;
};

export { VMDetailsItemTemplate as default };

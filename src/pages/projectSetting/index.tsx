
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import  { Radio, CheckboxProps, Form, Input, Dropdown, DropdownProps, DropdownItemProps } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { cloneDeep } from 'lodash';
import ProjectLayout from 'layout/projectLayout';
import Icon from 'components/Icon';
import Button from 'components/Button';
import message from 'components/MessageBox';
import { getMemberList } from 'services/member';
import { getProjectApprovalSettings, saveSettings } from 'services/project';
import { IApprovalSetting } from 'interfaces/approval';
import { IMember, IMemberList } from 'interfaces/member';
import { IOption } from 'interfaces/targeting';
import styles from './index.module.scss';

interface IParams {
  projectKey: string;
  environmentKey: string;
}

const ProjectSetting = () => {
  const intl = useIntl();
  const { projectKey } = useParams<IParams>();
  const [ approvalSetting, saveApprovalSetting ] = useState<IApprovalSetting[]>([]);
  const [ options, saveOptions ] = useState<IOption[]>([]);

  const init = useCallback(async () => {
    getProjectApprovalSettings<IApprovalSetting[]>(projectKey).then(res => {
      const { success, data } = res;
      if (success && data) {
        saveApprovalSetting(data);
      }
    });

    const res = await getMemberList<IMemberList>({
      pageIndex: 0,
      pageSize: 10,
    });

    const { success, data } = res;
    if (success && data) {
      const { content } = data;
      const options = content.map((member: IMember) => {
        return ({
          key: member.account,
          value: member.account,
          text: member.account,
        });
      });
      saveOptions(options);
    }
  }, [projectKey]);

  useEffect(() => {
    init();
  }, [init]);

  const renderLabel = useCallback((label: DropdownItemProps) => {
    return ({
      content: label.text,
      removeIcon: <Icon customClass={styles['dropdown-remove-icon']} type='close' />,
    });
  }, []);

  const handleChangeApproval = useCallback((environmentKey: string, approvals: string[]) => {
    const settings = cloneDeep(approvalSetting);
    settings.forEach((setting: IApprovalSetting) => {
      if (setting.environmentKey === environmentKey) {
        setting.approvals = approvals;
      }
    });

    saveApprovalSetting(settings);
  }, [approvalSetting]);

  const saveToggleDisable = useCallback((environmentKey:string, checked: boolean) => {
    const settings = cloneDeep(approvalSetting);
    settings.forEach((setting: IApprovalSetting) => {
      if (setting.environmentKey === environmentKey) {
        setting.enable = checked;
      }
    });

    saveApprovalSetting(settings);
  }, [approvalSetting]);

  const handleSubmit = useCallback(() => {
    saveSettings(projectKey, {
      approvalSettings: approvalSetting,
    }).then(() => {
      message.success(intl.formatMessage({id: 'toggles.settings.save.success'}));
    });
  }, [intl, approvalSetting]);

  return (
    <ProjectLayout>
      <div className={styles.setting}>
        <div className={styles.content}>
          <div className={styles.title}>
            <FormattedMessage id='common.toggle.settings.text' />
          </div>
          <div className={styles.tips}>
            <Icon type='warning-circle' customClass={styles['warning-circle']}></Icon>
            <FormattedMessage id='toggles.settings.tips' />
          </div>
          <div className={styles.approval}>
            <FormattedMessage id='toggles.settings.pulbish.approval' />
          </div>
          <div>
            <Form className={styles['approval-form']}>
              {
                approvalSetting.map((setting: IApprovalSetting) => {
                  return (
                    <Form.Group className={styles.group}>
                      <Form.Field width={4}>
                        <label className={styles.label}>
                          <FormattedMessage id='common.environment.text' />:
                        </label>
                        <Input value={setting.environmentKey} />
                      </Form.Field>
                      <Form.Field width={12}>
                        <label className={styles.label}>
                          <FormattedMessage id='toggles.settings.approver' />:
                        </label>
                        <Dropdown
                          placeholder={intl.formatMessage({id: '请选择审批人'})}
                          search
                          selection
                          multiple
                          floating
                          options={options}
                          value={setting.approvals}
                          openOnFocus={false}
                          renderLabel={renderLabel}
                          icon={<Icon customClass={styles['angle-down']} type='angle-down' />}
                          noResultsMessage={null}
                          onChange={async (e: SyntheticEvent, detail: DropdownProps) => {
                            // @ts-ignore detail value
                            handleChangeApproval(setting.environmentKey, detail.value);
                          }}
                        />
                      </Form.Field>
                      <Form.Field width={2}>
                        <label className={styles.label}>
                          <FormattedMessage id='开启审批' />:
                        </label>
                        <Radio
                          size='mini'
                          toggle 
                          checked={setting.enable}
                          onChange={(e: SyntheticEvent, data: CheckboxProps) => saveToggleDisable(setting.environmentKey, !!data.checked)} 
                          className={styles['approval-status']} 
                        />
                      </Form.Field>
                    </Form.Group>
                  );
                })
              }
            </Form>
          </div>
        </div>
        <div className={styles.footer}>
          <Button basic type='reset'>
            <FormattedMessage id='common.cancel.text' />
          </Button>
          <Button className={styles['publish-btn']} primary type="submit" onClick={handleSubmit}>
            <span className={styles['publish-btn-text']}>
              <FormattedMessage id='common.save.text' />
            </span>
          </Button>
        </div>
      </div>
    </ProjectLayout>

  );
};

export default ProjectSetting;
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Table, Popup } from 'semantic-ui-react';
import dayjs from 'dayjs';
import Icon from 'components/Icon';
import styles from './index.module.scss';
import { IApproval } from 'interfaces/approval';

interface IProps {
  type: string;
  approval: IApproval;
}

const ListItem = (props: IProps) => {
  const { approval, type } = props;
  const history = useHistory();

  const gotoToggle = useCallback((projectKey, environmentKey, toggleKey) => {
    history.push(`/${projectKey}/${environmentKey}/${toggleKey}/targeting`);
  }, [history]);

	return (
    <Table.Row className={styles['list-item']}>
      <Table.Cell>
        <div className={styles['list-item-title']}>
          <Popup
            inverted
            className={styles.popup}
            trigger={
              <span>
                { approval.title }
              </span>
            }
            content={
              <div className={styles['popup-content']}>
                { approval.title }
              </div>
            }
            position='top left'
          />
          
          {
            approval.canceled && approval.status === 'PASS' && (
              <Popup
                inverted
                className={styles.popup}
                trigger={
                  <span className={styles['cancel-publish']}>
                    <FormattedMessage id='approvals.table.header.abandoned' />
                  </span>
                }
                content={
                  <div className={styles['popup-content']}>
                    <FormattedMessage id='approvals.table.header.comment' />: {approval.cancelReason}
                  </div>
                }
                position='top center'
              />
            )
          }
        </div>
      </Table.Cell>
      <Table.Cell className={styles['column-toggle']}>
        <div 
          className={styles['list-item-toggle']} 
          onClick={() => {
            gotoToggle(approval.projectKey, approval.environmentKey, approval.toggleKey);
          }}
        >
          <div>
            {
              approval.locked && (
                <Popup
                  inverted
                  className={styles.popup}
                  trigger={
                    <span className={styles['toggle-lock-bg']}>
                      <Icon type='lock' customClass={styles['toggle-lock']}></Icon>
                    </span>   
                  }
                  content={
                    <div>
                      <div className={styles['popup-line']}><FormattedMessage id='common.lock.text' /></div>
                      <div className={styles['popup-line']}><FormattedMessage id='common.lock.by' />: { approval.submitBy }</div>
                      <div className={styles['popup-line']}><FormattedMessage id='common.lock.time' />: { dayjs(approval.lockedTime).format('YYYY-MM-DD HH:mm:ss') }</div>
                    </div>
                  }
                  position='top center'
                />
              )
            }
            { approval.toggleName }
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        {
          approval.status === 'PENDING' && (
            <div className={styles['status-pending']}>
              <span className={`${styles['status-circle']} ${styles['status-circle-pending']}`}></span>
              <span className={styles['status-text']}>
                <FormattedMessage id='approvals.status.pending' />
              </span>
            </div>
          )
        }
        {
          approval.status === 'REJECT' && (
            <div className={styles['status-declined']}>
              <span className={`${styles['status-circle']} ${styles['status-circle-declined']}`}></span>
              <span className={styles['status-text']}>
                <FormattedMessage id='approvals.status.declined' />
              </span>
            </div>
          )
        }
        {
          approval.status === 'PASS' && (
            <div className={styles['status-pass']}>
              <span className={`${styles['status-circle']} ${styles['status-circle-pass']}`}></span>
              <span className={styles['status-text']}>
                <FormattedMessage id='approvals.status.accepted' />
              </span>
            </div>
          )
        }
        {
          approval.status === 'JUMP' && (
            <div  className={styles['status-jump']}>
              <span className={`${styles['status-circle']} ${styles['status-circle-jump']}`}></span>
              <span className={styles['status-text']}>
                <FormattedMessage id='approvals.status.skipped' />
              </span>
            </div>
          )
        }
        {
          approval.status === 'REVOKE' && (
            <div  className={styles['status-revoke']}>
              <span className={`${styles['status-circle']} ${styles['status-circle-revoke']}`}></span>
              <span className={styles['status-text']}>
                <FormattedMessage id='approvals.status.withdrawn' />
              </span>
            </div>
          )
        }
      </Table.Cell>
      <Table.Cell>
        <div className={styles['list-item-project']}>
          {approval.projectName}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div>
          {approval.environmentName}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div>
          <div>{approval.submitBy}</div>
          <div className={styles['list-item-time']}>
            {dayjs(approval.createdTime).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </Table.Cell>
      {
        type === 'APPLY' && (
          <Table.Cell>
            <div>
              {approval.reviewers.join(', ')}
            </div>
          </Table.Cell>
        )
      }
      <Table.Cell>
        <div>{approval.approvedBy}</div>
        <div className={styles['list-item-time']}>
          {approval.approvedBy && approval.modifiedTime ? dayjs(approval.modifiedTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className={styles['list-item-reason']}>
          {
            approval.comment ? (
              <Popup
                inverted
                className={styles.popup}
                trigger={
                  <span>
                    { approval.title }
                  </span>
                }
                content={
                  <div className={styles['popup-content']}>
                    { approval.title }
                  </div>
                }
                position='top left'
              />
            ) : (
              <span>-</span>
            )
          }
        </div>
      </Table.Cell>
    </Table.Row>
	);
};

export default ListItem;

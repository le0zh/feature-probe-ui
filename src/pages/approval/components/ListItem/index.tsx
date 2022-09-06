import { SyntheticEvent, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Table, Popup } from 'semantic-ui-react';
import dayjs from 'dayjs';
import Icon from 'components/Icon';
import Modal from 'components/Modal';
import message from 'components/MessageBox';
import styles from './index.module.scss';
import { IApproval } from 'interfaces/approval';

interface ILocationParams {
  projectKey: string;
  environmentKey: string;
}

interface IProps {
  status: string;
  approval: IApproval
}

const ListItem = (props: IProps) => {
  const { status, approval } = props;
  const [ toggleStatus, saveToggleStatus ] = useState<number>(2);

	return (
    <Table.Row
      className={styles['list-item']}
    >
      <Table.Cell>
        <div className={styles['list-item-title']}>
          标题标题标题标题标题标题标题标题标题标题标题标题标题标题
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className={styles['list-item-toggle']}>
          开关
        </div>
      </Table.Cell>
      {
        (status === 'PASS' || status === 'JUMP') && (
          <Table.Cell>
            {
              toggleStatus === 0 && (
                <div className={styles['list-status']}>
                  <span className={`${styles['list-status-icon']} ${styles['list-status-icon-published']}`}></span>
                  <span>已发布</span>
                </div>
              )
            }
            {
              toggleStatus === 1 && (
                <div className={styles['list-status']}>
                  <span className={`${styles['list-status-icon']} ${styles['list-status-icon-unpublished']}`}></span>
                  <span>未发布</span>
                </div>
              )
            }
            {
              toggleStatus === 2 && (
                <div className={styles['list-status']}>
                  <span className={`${styles['list-status-icon']} ${styles['list-status-icon-canceled']}`}></span>
                  <span className={styles['list-status-canceled-text']}>已取消</span>
                  <Popup
                    inverted
                    trigger={
                      <Icon customClass={styles['icon-info']} type='info' />
                    }
                    content={'22222'}
                    position='top center'
                    className={styles.popup}
                  />
                </div>
              )
            }
          </Table.Cell>
        )
      }
      <Table.Cell>
        <div className={styles['list-item-project']}>
          项目
        </div>
      </Table.Cell>
      <Table.Cell>
        <div>
          环境
        </div>
      </Table.Cell>
      <Table.Cell>
        <div>
          <div>申请人</div>
          <div className={styles['list-item-time']}>申请时间</div>
        </div>
      </Table.Cell>
      {
        status === 'JUMP' && (
          <Table.Cell>
            <div>跳过时间</div>
          </Table.Cell>
        )
      }
      {
        status === 'JUMP' && (
          <Table.Cell >
            <div className={styles['list-item-reason']}>
              跳过理由跳过理由跳过理由跳过理由跳过理由跳过理由跳过理由
            </div>
          </Table.Cell>
        )
      }
      {
        (status === 'PASS' || status === 'REJECT') && (
          <Table.Cell>
            <div>审批人</div>
            <div className={styles['list-item-time']}>审批时间</div>
          </Table.Cell>
        )
      }
      {
        status === 'PASS' && (
          <Table.Cell>
            <div className={styles['list-item-reason']}>
              通过理由通过理由通过理由通过理由通过理由通过理由通过理由
            </div>
          </Table.Cell>
        )
      }
      {
        status === 'REJECT' && (
          <Table.Cell>
            <div className={styles['list-item-reason']}>
              拒绝理由拒绝理由拒绝理由拒绝理由拒绝理由拒绝理由拒绝理由
            </div>
          </Table.Cell>
        )
      }
      {
        status === 'REVOKE' && (
          <Table.Cell>
            撤回时间
          </Table.Cell>
        )
      }
      {
        status === 'REVOKE' && (
          <Table.Cell>
            <div className={styles['list-item-reason']}>
              撤回理由撤回理由撤回理由撤回理由撤回理由撤回理由撤回理由撤回理由
            </div>
          </Table.Cell>
        )
      }
      {
        (status === 'PASS' || status === 'JUMP') && (
          <Table.Cell>
            发布时间
          </Table.Cell>
        )
      }
      {
        status === 'PENDING' && (
          <Table.Cell className={styles['list-operation']}>
            <div>
              <span 
                className={styles['list-operation-btn']} 
                onClick={(e) => { 
                  document.body.click();
                  e.stopPropagation();
                }}
              >
                通过
              </span>
              <span 
                className={styles['list-operation-btn']} 
                onClick={(e) => { 
                  document.body.click();
                  e.stopPropagation();
                }}
              >
                拒绝
              </span>
              <span 
                className={styles['list-operation-btn']} 
                onClick={(e) => { 
                  document.body.click();
                  e.stopPropagation();
                }}
              >
                撤回
              </span>
            </div>
                  
          </Table.Cell>
        )
      }
    </Table.Row>
	);
};

export default ListItem;

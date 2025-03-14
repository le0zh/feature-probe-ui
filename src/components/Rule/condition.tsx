import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Form, Select, Dropdown, DropdownProps, DropdownItemProps } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import Datetime from 'react-datetime';
import moment from 'moment';
import Icon from 'components/Icon';
import message from 'components/MessageBox';
import canlendar from 'images/calendar.svg';
import { IRule, ICondition, IOption } from 'interfaces/targeting';
import { IContainer } from 'interfaces/provider';
import { ISegment, ISegmentList } from 'interfaces/segment';
import { 
  getAttrOptions,
  // attributeOptions,
  // getSubjectSegmentOptions,
  timezoneOptions,
  DATETIME_TYPE,
  SEGMENT_TYPE,
  SEMVER_TYPE,
  NUMBER_TYPE,
} from './constants';
import styles from './index.module.scss';

interface IProps {
  rule: IRule;
  disabled?: boolean;
  ruleIndex: number;
  useSegment?: boolean;
  conditionIndex: number;
  condition: ICondition;
  subjectOptions: IOption[];
  ruleContainer: IContainer;
  variationContainer?: IContainer;
  segmentContainer?: IContainer;
  hooksFormContainer: IContainer;
}

const NUMBER_REG = /^(-?\d+)(\.\d+)?$/i;
const SEMVER_REG = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/i;
const SPECIAL_PREDICATE = ['<', '<=', '>', '>='];

const RuleContent = (props: IProps) => {
  const { 
    rule,
    disabled,
    ruleIndex,
    // useSegment,
    subjectOptions,
    conditionIndex,
    condition,
    ruleContainer, 
    segmentContainer,
    hooksFormContainer, 
  } = props;

  const intl = useIntl();
  const [ options, setOption ] = useState<IOption[]>();
  const segmentList: ISegmentList = segmentContainer?.useContainer().segmentList;;

  const {
    handleChangeAttr,
    handleChangeOperator,
    handleChangeDateTime,
    handleChangeTimeZone,
    handleChangeValue,
    handleDeleteCondition,
  } = ruleContainer.useContainer();

  const {
    formState: { errors },
    register,
    unregister,
    setValue,
    trigger,
    getValues,
    clearErrors,
  } = hooksFormContainer.useContainer();

  const handleDelete = useCallback(async (ruleIndex: number, conditionIndex: number, ruleId?: string) => {
    for(const key in getValues()) {
      if (key.startsWith(`rule_${ruleId}_condition`)) {
        unregister(key);
        clearErrors(key);
      }
    }
    await handleDeleteCondition(ruleIndex, conditionIndex);
  }, [unregister, clearErrors, getValues, handleDeleteCondition]);

  const renderLabel = useCallback((label: DropdownItemProps) => {
    return ({
      content: label.text,
      removeIcon: <Icon customClass={styles['dropdown-remove-icon']} type='close' />,
    });
  }, []);

  useEffect(() => {
    if (segmentList) {
      const { content } = segmentList;
      const options = content.map((segment: ISegment) => {
        return ({
          key: segment.key,
          value: segment.key,
          text: segment.name,
        });
      });
      setOption(options);
    }
  }, [segmentList]);

  const valuesOptions = condition.objects?.map((val: string) => {
    return {
      key: val,
      text: val,
      value: val,
    };
  });

  const inputProps = {
    placeholder: intl.formatMessage({id: 'common.dropdown.placeholder'}),
    disabled: disabled,
  };

  return (
    <div className={styles['rule-item']} key={condition.id}>
      {
        conditionIndex === 0 ? (
          <span className={`${styles['rule-item-prefix']} ${styles['rule-item-first']}`}>
            <span className={styles['rule-item-text']}>If</span>
          </span>
        ) : (
          <span className={styles['rule-item-prefix']}>
            <span className={styles['rule-item-text']}>and</span>
          </span>
        ) 
      }
      <Form.Group className={styles['rule-item-left']} widths='equal'>
        <Form.Field className={styles['rule-item-subject']}>
          <Dropdown
            className={styles['rule-item-subject-dropdown']}
            placeholder={intl.formatMessage({id: 'targeting.rule.subject.placeholder'})}
            search
            floating
            allowAdditions
            options={subjectOptions}
            value={condition.subject}
            openOnFocus={true}
            closeOnChange={true}
            noResultsMessage={null}
            disabled={condition.type === SEGMENT_TYPE || disabled}
            icon={null}
            error={ errors[`rule_${rule.id}_condition_${condition.id}_subject`] ? true : false }
            {
              ...register(`rule_${rule.id}_condition_${condition.id}_subject`, { 
                required: {
                  value: true,
                  message: intl.formatMessage({id: 'targeting.rule.subject.required'})
                }, 
              })
            }
            onChange={async (e: SyntheticEvent, detail: DropdownProps) => {
              handleChangeAttr(ruleIndex, conditionIndex, detail.value);
              setValue(detail.name, detail.value);
              await trigger(`rule_${rule.id}_condition_${condition.id}_subject`);
            }}
          />
          { 
            errors[`rule_${rule.id}_condition_${condition.id}_subject`] &&
              <div className={styles['error-text']}>
                { intl.formatMessage({id: 'targeting.rule.subject.required'}) }
              </div>
          }
        </Form.Field>

        <Form.Field className={styles['rule-item-operator']}>
          <Select 
            floating
            className={styles['rule-item-operator-dropdown']}
            value={condition.predicate}
            options={getAttrOptions(intl, condition.type)}
            placeholder={intl.formatMessage({id: 'targeting.rule.operator.placeholder'})}
            openOnFocus={false}
            disabled={disabled}
            icon={
              <>
                <div className={styles['rule-item-type']}>
                  <div className={styles['rule-item-type-text']}>
                    {condition.type}
                  </div>
                </div>
                <Icon customClass={styles['angle-down']} type='angle-down' />
              </>
            }
            error={ errors[`rule_${rule.id}_condition_${condition.id}_predicate`] ? true : false }
            {
              ...register(`rule_${rule.id}_condition_${condition.id}_predicate`, { 
                required: true, 
              })
            }
            onChange={async (e: SyntheticEvent, detail: DropdownProps) => {
              // @ts-ignore detail value
              if ((condition.type === NUMBER_TYPE || condition.type === SEMVER_TYPE) && SPECIAL_PREDICATE.includes(detail.value)) {
                handleChangeValue(ruleIndex, conditionIndex, []);
              } 

              handleChangeOperator(ruleIndex, conditionIndex, detail.value);
              setValue(detail.name, detail.value);
              await trigger(`rule_${rule.id}_condition_${condition.id}_predicate`);
            }}
          />
          { 
            errors[`rule_${rule.id}_condition_${condition.id}_predicate`] && 
              <div className={styles['error-text']}>
                { intl.formatMessage({id: 'targeting.rule.operator.required'}) }
              </div> 
          }
        </Form.Field>

        {
          condition.type === DATETIME_TYPE ? (
            <>
              <Form.Field 
                width={6}
                disabled={disabled}
                className={styles['rule-item-datetime']}
                error={ errors[`rule_${rule.id}_condition_${condition.id}_datetime`] ? true : false  }
                {
                  ...register(`rule_${rule.id}_condition_${condition.id}_datetime`, { 
                    required: true, 
                  })
                }
              >
                <Datetime
                  timeFormat='HH:mm:ss'
                  inputProps={inputProps}
                  value={condition.datetime ? moment(condition.datetime) : moment()}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={async (e: any) => {
                    handleChangeDateTime(ruleIndex, conditionIndex, e.format().slice(0, 19));
                    setValue(`rule_${rule.id}_condition_${condition.id}_datetime`, e.format().slice(0, 19));
                    await trigger(`rule_${rule.id}_condition_${condition.id}_datetime`);
                  }}
                />
                { 
                  errors[`rule_${rule.id}_condition_${condition.id}_datetime`] && 
                    <div className={styles['error-text']}>
                      { intl.formatMessage({id: 'common.dropdown.placeholder'}) }
                    </div> 
                }
                <img src={canlendar} alt='canlendar' className={styles['rule-item-datetime-canlendar']} />
              </Form.Field>
              <Form.Field width={6}>
                <Dropdown
                  placeholder={intl.formatMessage({id: 'common.dropdown.placeholder'})}
                  search
                  selection
                  floating
                  allowAdditions={false}
                  disabled={disabled}
                  options={timezoneOptions()}
                  value={condition.timezone || moment().format().slice(-6)}
                  openOnFocus={false}
                  renderLabel={renderLabel}
                  icon={<Icon customClass={styles['angle-down']} type='angle-down' />}
                  error={ errors[`rule_${rule.id}_condition_${condition.id}_timezone`] ? true : false }
                  noResultsMessage={null}
                  {
                    ...register(`rule_${rule.id}_condition_${condition.id}_timezone`, { 
                      required: true, 
                    })
                  }
                  onChange={async (e: SyntheticEvent, detail: DropdownProps) => {
                    handleChangeTimeZone(ruleIndex, conditionIndex, detail.value);
                    setValue(detail.name, detail.value);
                    await trigger(`rule_${rule.id}_condition_${condition.id}_timezone`);
                  }}
                />
                { 
                  errors[`rule_${rule.id}_condition_${condition.id}_timezone`] && 
                    <div className={styles['error-text']}>
                      <FormattedMessage id='common.dropdown.placeholder' />
                    </div> 
                }
              </Form.Field>
            </>
          ) : (
            <Form.Field width={6}>
              <Dropdown
                placeholder={
                  condition.type !== SEGMENT_TYPE 
                  ? intl.formatMessage({id: 'targeting.rule.values.placeholder'})
                  : intl.formatMessage({id: 'common.dropdown.placeholder'})
                }
                search
                selection
                multiple
                floating
                disabled={disabled}
                allowAdditions={condition.type !== SEGMENT_TYPE }
                options={condition.type !== SEGMENT_TYPE ? valuesOptions : options}
                value={condition.objects}
                openOnFocus={false}
                renderLabel={renderLabel}
                icon={condition.type === SEGMENT_TYPE  && <Icon customClass={styles['angle-down']} type='angle-down' />}
                error={ errors[`rule_${rule.id}_condition_${condition.id}_objects`] ? true : false }
                noResultsMessage={null}
                {
                  ...register(`rule_${rule.id}_condition_${condition.id}_objects`, { 
                    required: true, 
                  })
                }
                onChange={async (e: SyntheticEvent, detail: DropdownProps) => {
                  let result = true;
                  if (condition.type === NUMBER_TYPE) {
                    // @ts-ignore detail value
                    result = detail.value.every((item) => {
                      return NUMBER_REG.test(item);
                    });

                    // @ts-ignore detail value
                    if (condition.predicate && SPECIAL_PREDICATE.includes(condition.predicate) && detail.value.length > 1) {
                      return;
                    } 
                  } 
                  else if (condition.type === SEMVER_TYPE) {
                    // @ts-ignore detail value
                    result = detail.value.every((item) => {
                      return SEMVER_REG.test(item);
                    });

                    // @ts-ignore detail value
                    if (condition.predicate && SPECIAL_PREDICATE.includes(condition.predicate) && detail.value.length > 1) {
                      return;
                    } 
                  }
                  if (!result) {
                    message.error(intl.formatMessage({id: 'targeting.invalid.value.text'}));
                    handleChangeValue(ruleIndex, conditionIndex, []);
                    return;
                  };

                  setValue(detail.name, detail.value);
                  handleChangeValue(ruleIndex, conditionIndex, detail.value);
                  await trigger(`rule_${rule.id}_condition_${condition.id}_objects`);
                }}
              />
              { 
                errors[`rule_${rule.id}_condition_${condition.id}_objects`] && 
                  <div className={styles['error-text']}>
                    { 
                      condition.type !== SEGMENT_TYPE
                      ? intl.formatMessage({id: 'targeting.rule.values.required'})
                      : intl.formatMessage({id: 'common.dropdown.placeholder'})
                    }
                  </div> 
              }
            </Form.Field>
          )
        }
      </Form.Group>
      {
        !disabled && <Icon 
          customClass={styles['icon-minus']} type='minus'
          onClick={() => handleDelete(ruleIndex, conditionIndex, rule.id)}
        />
      }
    </div>
  );
};

export default RuleContent;
import { useState, SyntheticEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { InputOnChangeData, TextAreaProps } from 'semantic-ui-react';
import { ICondition, IRule, IServe } from 'interfaces/targeting';
import { DATETIME_TYPE, SEGMENT_TYPE } from 'components/Rule/constants';

export const useRule = () => {
  const [rules, saveRules] = useState<IRule[]>([]);

  const handleAddRule = () => {
    const rule: IRule = {
      id: uuidv4(),
      name: '',
      serve: undefined,
      conditions: [{
        id: uuidv4(),
        type: 'string',
        subject: '',
        predicate: '',
      }],
    };
    rules.push(rule);
    saveRules([...rules]);
  };

  const handleDeleteRule = (index: number) => {
    rules.splice(index, 1);
    saveRules([...rules]);
  };

  const handleInputRuleName = (ruleIndex: number, name: string) => {
    rules[ruleIndex].name = name;
    saveRules([...rules]);
  };

  const handleAddCondition = (index: number, type: string) => {
    const condition: ICondition = {
      id: uuidv4(),
      type: type,
      subject:  type === SEGMENT_TYPE ? 'user' : '',
      predicate: '',
    };
    if (type === DATETIME_TYPE) {
      condition.datetime = moment().format().slice(0, 19);
      condition.timezone = moment().format().slice(-6);
    }
    rules[index].conditions.push(condition);
    saveRules([...rules]);
  };

  const handleDeleteCondition = (ruleIndex: number, conditionIndex: number) => {
    rules[ruleIndex].conditions.splice(conditionIndex, 1);
    saveRules([...rules]);
  };

  const handleChangeAttr = (ruleIndex: number, conditionIndex: number, value: string) => {
    rules[ruleIndex].conditions[conditionIndex].subject = value;
    saveRules([...rules]);
  };

  const handleChangeType = (ruleIndex: number, conditionIndex: number, value: string) => {
    rules[ruleIndex].conditions[conditionIndex].type = value;
    saveRules([...rules]);
  };

  const handleChangeOperator = (ruleIndex: number, conditionIndex: number, value: string) => {
    rules[ruleIndex].conditions[conditionIndex].predicate = '' + value;
    saveRules([...rules]);
  };

  const handleChangeValue = (ruleIndex: number, conditionIndex: number, value: string[]) => {
    rules[ruleIndex].conditions[conditionIndex].objects = value;
    saveRules([...rules]);
  };

  const handleChangeDateTime = (ruleIndex: number, conditionIndex: number, value: string) => {
    rules[ruleIndex].conditions[conditionIndex].datetime = value;
    saveRules([...rules]);
  };

  const handleChangeTimeZone = (ruleIndex: number, conditionIndex: number, value: string) => {
    rules[ruleIndex].conditions[conditionIndex].timezone = value;
    saveRules([...rules]);
  };

  const handleChangeServe = (ruleIndex: number, item: IServe) => {
    rules[ruleIndex].serve = item;
    saveRules([...rules]);
  };

  return { 
    rules,
    saveRules,
    handleAddRule, 
    handleDeleteRule, 
    handleInputRuleName,
    handleAddCondition,
    handleDeleteCondition,
    handleChangeAttr,
    handleChangeType,
    handleChangeOperator,
    handleChangeValue,
    handleChangeDateTime,
    handleChangeTimeZone,
    handleChangeServe,
  };
};

export const useSegmentInfo = () => {
  const [ segmentInfo, saveSegmentInfo ] = useState({
    name: '',
    key: '',
    description: '',
  });

  const [ originSegmentInfo, saveOriginSegmentInfo ] = useState({
    name: '',
    key: '',
    description: '',
  });

  const handleChange = (e: SyntheticEvent, detail: InputOnChangeData | TextAreaProps , type: string) => {
    const { value } = detail;
    // @ts-ignore detail value
    segmentInfo[type] = value;
    saveSegmentInfo({...segmentInfo});
  };

  return {
    segmentInfo,
    originSegmentInfo,
    handleChange,
    saveSegmentInfo,
    saveOriginSegmentInfo,
  };
};

export const useReactHookForm = () => {
  return {
    ...useForm(),
  };
};

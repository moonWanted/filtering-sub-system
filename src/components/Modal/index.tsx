import React, { useEffect } from 'react'
import { Formik, Field, Form, FormikHelpers, FieldArray, ErrorMessage } from 'formik'

import { IFilter, IFilterDefinition } from '../../store/types'

type Props = {
  definitions: IFilterDefinition[];
  isEdit?: boolean;
  filter?: IFilter;
  onSubmit: (values: any) => void;
};

type UpdateFilterProps = {
  filter: any;
  index: number;
  updateField: (field: string, value: string) => void;
};

interface Values {
  name: string;
  conditions:
    {
      definition_id: string;
      type?: string;
      operator: string;
      value1: string;
      value2: string;
    }[]
}

export const Modal = (props: Props): JSX.Element => {

  const { isEdit, definitions, filter, onSubmit } = props

  const initialValues: Values = {
      name: '',
      conditions: [{
        definition_id: definitions[0]?.id || '',
        type: '',
        operator: '',
        value1: '',
        value2: ''
      }],
    }

  const EditFilterUpdate = (props: UpdateFilterProps) => {

    const { filter, index, updateField } = props

    useEffect(() => {
      if(filter) {
        updateField(`name`, filter.name)
        updateField(`conditions.${index}.definition_id`, filter.conditions[index].definition_id)
        updateField(`conditions.${index}.type`, definitions.find(definition => definition.id === filter.conditions[index].definition_id)?.type || '')
        updateField(`conditions.${index}.operator`, filter.conditions[index].operator)
        if (Array.isArray(filter.conditions[index].value)) {
          updateField(`conditions.${index}.value1`, filter.conditions[index].value[0])
          updateField(`conditions.${index}.value2`, filter.conditions[index].value[1])
        } else {
          updateField(`conditions.${index}.value1`, filter.conditions[index].value)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])

    return (
      <></>
    )
  }

  const numberValidator = (value: string, type: string | undefined) => {
    let error: string | undefined = undefined
    if (type === 'Numeric') {
      if (!/^\d+$/.test(value) ) error = 'Value must be a number'
    }
    if(type === 'Date') {
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) error = 'Date must be in format YYYY-MM-DD'
    }
    if(type === 'Text') {
      if (value.length > 60) error = 'Only 60 characters allowed'
    }
    return error
  }

  return (
    <div className="modal fade" id={isEdit ? 'editModal' : 'addModal'}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Edit filter' : 'Add filter'}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <Formik
            initialValues={initialValues}
            onSubmit={(
              values: Values,
              { resetForm }: FormikHelpers<Values>
            ) => {
              const formattedValues = {
                ...values,
                conditions: [...values.conditions.map(condition => {
                  return {
                    definition_id: condition.definition_id,
                    type: definitions.find(definition => definition.id === condition.definition_id)?.type || '',
                    operator: condition.operator,
                    value: condition.value2 ? [condition.value1, condition.value2] : condition.value1
                  }
                })]
              }

              onSubmit(formattedValues)
              resetForm()
            }}
          >
            {({ values , setFieldValue, resetForm, errors}) => (
            <Form>

              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <Field className="form-control" id="name" name="name" placeholder="Enter name" />
                </div>

                <FieldArray name="conditions">
                  {({ insert, remove, push }) => (
                    <div>

                      {values.conditions.length > 0 &&
                        values.conditions.map((condition, index) => (
                          <div className="row" key={index}>

                            {filter && <EditFilterUpdate filter={filter} index={index} updateField={setFieldValue}/>}

                            <div className="mb-3">
                              <label htmlFor={`conditions.${index}.definition_id`} className="form-label">Definition</label>
                              <Field
                                as="select"
                                id={`conditions.${index}.definition_id`}
                                name={`conditions.${index}.definition_id`}
                                className="form-select"
                                onChange={(e: any) => {
                                  // set options on definition change
                                  const definition = definitions.find(d => d.id === e.target.value)
                                  setFieldValue(`conditions.${index}.definition_id`, e.target.value)
                                  setFieldValue(`conditions.${index}.type`, definition?.type)
                                  setFieldValue(`conditions.${index}.operator`, definition?.operators[0])
                                }}
                              >
                                {definitions.map(definition =>
                                  (<option key={definition.id} value={definition.id}>{definition.label}</option>)
                                )}
                              </Field>
                            </div>

                            <div className="mb-3">
                              <label htmlFor={`conditions.${index}.type`} className="form-label">Type</label>
                              <Field
                                className="form-control"
                                id={`conditions.${index}.type`}
                                name={`conditions.${index}.type`}
                                disabled
                              />
                            </div>

                            <div className="mb-3">
                              <label htmlFor={`conditions.${index}.operator`} className="form-label">Operator</label>
                              <Field
                                as="select"
                                id={`conditions.${index}.operator`}
                                name={`conditions.${index}.operator`}
                                className="form-select"
                              >
                                {definitions.find(definition => definition.id === condition.definition_id)?.operators.map(operator => (
                                  <option key={operator} value={operator}>{operator}</option>
                                ))}
                              </Field>
                            </div>

                            <div className="mb-3">
                              <label htmlFor={`conditions.${index}.value1`} className="form-label">Value</label>
                              <Field
                                className="form-control"
                                id={`conditions.${index}.value1`}
                                validate={(value:string) => numberValidator(value, condition.type)}
                                name={`conditions.${index}.value1`}
                                placeholder="Enter value"
                              />
                              <ErrorMessage name={`conditions.${index}.value1`}>{msg => <div style={{color: '#dc3545'}}>{msg}</div>}</ErrorMessage>

                              {condition.operator === 'between' && (
                                <>
                                  <label htmlFor={`conditions.${index}.value2`} className="form-label"></label>
                                  <Field
                                  className="form-control"
                                  id={`conditions.${index}.value2`}
                                  validate={(value:string) => numberValidator(value, condition.type)}
                                  name={`conditions.${index}.value2`}
                                  placeholder="Enter value"
                                  />
                                  <ErrorMessage name={`conditions.${index}.value2`}>{msg => <div style={{color: '#dc3545'}}>{msg}</div>}</ErrorMessage>
                                </>
                              )}
                            </div>

                            <div className="col">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => remove(index)}
                                disabled={values.conditions.length === 1}
                              >
                                X
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary ms-1"
                                onClick={() => push({
                                  definition: definitions[0]?.id || '',
                                  type: '',
                                  operator: '',
                                  value: ''
                                })}
                              >
                                Add Condition
                              </button>
                            </div>
                          </div>
                        ))}

                    </div>
                  )}
                </FieldArray>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => resetForm()}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    data-bs-dismiss="modal"
                    disabled={Object.keys(errors).length > 0}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </Form>)}
          </Formik>
        </div>
      </div>
    </div>
  )
}
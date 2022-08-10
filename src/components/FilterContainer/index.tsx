import React, { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { ToastContainer, toast } from 'react-toastify'

import filterStore from '../../store/filter'
import { Modal } from '../Modal'

import './index.css'
import 'react-toastify/dist/ReactToastify.css'

const Operators: {
  [key: string]: string;
} = {
  'eq': 'equal',
  'gt': 'greater than',
  'lt': 'less than',
  'between': 'between',
}

export const FilterContainer = observer(() => {
  const { getFilters, setFilter, getDefinitions, clearFilter, definitions, filter } = filterStore

  useEffect(() => {
    getFilters()
    getDefinitions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errorToast = (message: string) => {
    toast.error("Request Error", {
      position: toast.POSITION.TOP_RIGHT
    });
  }

  const successToast = (message: string) => {
    toast.success("Request Success", {
      position: toast.POSITION.TOP_RIGHT
    });
  }

  const handleEdit = (data: any) => {
    fetch(`http://localhost:8000/filters/${filter?.id}`, {method: 'PUT', body: JSON.stringify(data)})
      .then(res => res.json())
      .then(data => {
        setFilter(data.data)
        successToast('Filter updated')
      })
      .catch(err => errorToast('Request Error'))
  }

  const handleAdd = (data: any) => {
    fetch('http://localhost:8000/filters', {method: 'POST', body: JSON.stringify(data)})
      .then(res => res.json())
      .then(data => {
        getFilters()
        getDefinitions()
        successToast('Filter added')
      })
      .catch(err => errorToast('Request Error'))
  }

  return (
    <>
    <div className="container">
      <div className="buttonBlock">
        <button
          type="button"
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#addModal"
          onClick={() => clearFilter()}
        >
          Add Filter
        </button>
        <button
          type="button"
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#editModal"
          disabled={!filter}
        >
          Edit Filter
        </button>
      </div>
      <div>
        <h3>Filters:</h3>
        <FilterList />
      </div>

      <FilterDescription />
    </div>

      <Modal definitions={definitions} filter={filter || undefined} isEdit onSubmit={handleEdit} />
      <Modal definitions={definitions} onSubmit={handleAdd}  />
      <ToastContainer />
    </>
  );
})

const FilterList = observer(() => {
  const { filter, filters, getFilterDefinitions, getFilter } = filterStore

  useEffect(() => {
    if(filter) {
      const definitionIds = filter.conditions.map(c => c.definition_id)
      getFilterDefinitions(definitionIds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleFilterClick = (filterId: string) => {
    getFilter(filterId)
  }

  return (
    <div>
      <ul className="list-group">
        {filters.map(filter =>
          <li
            className="list-group-item filterItem"
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
          >
            {filter.name}
          </li>
        )}
      </ul>
    </div>
  );
})

const FilterDescription = observer(() => {
  const {filter, filterDefinitions} = filterStore

  return (
    <div className="descriptionBlock">
      {filter && (
        <>
          <h5>
            Filter description
          </h5>
          <div>
            <p><b>Name:</b> {filter.name}</p>
            <p><b>Conditions:</b></p>
            {filterDefinitions.map((definition, index) => {
              const value = filter.conditions[index]?.value

              return(
              <div key={definition.id}>
                <p>
                  {`${definition.label} ${Operators[filter.conditions[index]?.operator]} ${Array.isArray(value) ? `${value[0]} and ${value[1]}` : value}`}
                </p>
              </div>
            )})}
          </div>
        </>)}
    </div>
  )
})


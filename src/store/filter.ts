import { makeAutoObservable, runInAction } from 'mobx'

import { IFilter, IFilterDefinition } from './types'

class Filter {
  definitions: IFilterDefinition[] = []
  filterDefinitions: IFilterDefinition[] = []
  filters: IFilter[] = []
  filter: IFilter | null = null

  constructor() {
    makeAutoObservable(this)
  }

  getDefinitions = () => {
    fetch('http://localhost:8000/definitions')
      .then(response => response.json())
      .then(data => {
        runInAction(() => {
          this.definitions = data.data
        })
      })
  }

  getFilterDefinitions = (ids: string[]) => {
    this.filterDefinitions = this.definitions.filter(definition => ids.includes(definition.id)) || null
  }

   getFilters = () => {
    fetch('http://localhost:8000/filters',)
      .then(response => response.json())
      .then(data => {
        runInAction(() => {
          this.filters = data.data
        })
      })
  }

  getFilter = (id:string) => {
    this.filter = this.filters.find(filter => filter.id === id) || null
  }

  setFilter = (filter: IFilter) => {
    const filterIndex = this.filters.findIndex(f => f.id === filter.id)
    this.filters[filterIndex] = filter
  }

  clearFilter = () => {
    this.filter = null
  }
}

const filter = new Filter()

export default filter

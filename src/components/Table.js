import React, { useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables'; // Import Tabulator with all modules
import 'tabulator-tables/dist/css/tabulator.min.css'; // Import Tabulator CSS
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Table = () => {
  const tableRef = useRef(null); 
  const tabulatorInstance = useRef(null); 

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('tableData')) || []; 

    tabulatorInstance.current = new Tabulator(tableRef.current, {
      height: 600,
      ajaxURL: 'https://jsonplaceholder.typicode.com/todos',
      ajaxResponse: function (url, params, response) {
        const apiData = response.map(item => ({
          id: item.id,
          title: item.title,
          description: 'No description available',
          status: item.completed ? 'Done' : 'To Do',
        }));
        const mergedData = mergeData(apiData, savedData);
        return mergedData;
      },
      responsiveLayout: 'hide',
      layout: 'fitDataTable',
      addRowPos: 'bottom',
      pagination: 'local',
      paginationSize: 20,
      columns: [
        { title: 'Task ID', field: 'id', width: 150, hozAlign: 'center', headerFilter: 'input', editor: 'input' },
        { title: 'Title', field: 'title', hozAlign: 'center', width: 300, headerFilter: 'input', editor: 'input' },
        { title: 'Description', field: 'description', width: 650, hozAlign: 'center', headerFilter: 'input', editor: 'input' },
        { 
          title: 'Status', 
          field: 'status', 
          editor: 'list', 
          editorParams: { values: ['To Do', 'In Progress', 'Done'] }, 
          hozAlign: 'center', 
          width: 250, 
          headerFilter: 'input' 
        },
        {
          title: 'Action',
          formatter: () => `<button class='delete-btn'><i class="fa-solid fa-trash"></i></button>`,
          width: 100,
          hozAlign: 'center',
          headerSort: false,
          cellClick: (e, cell) => {
            const rowId = cell.getRow().getData().id;
            cell.getRow().delete();
            saveTableData();
            toast.success('Item deleted successfully!', {
              position: 'top-right',
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          },
        },
      ],
      headerVisible: true,
      headerSort: false, 
      headerFilterPlaceholder: 'Filter...', 
      cellEdited: function(cell) {
        saveTableData(); 
      },
      dataLoaded: function () {
        saveTableData(); 
      },
      rowDeleted: function () {
        saveTableData(); 
      },
    });

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
      }
    };
  }, []);

  // Add a new row to the table
  const handleAddRow = () => {
    // Retrieve the last used ID from localStorage, or set it to 200 if not present
    const lastUsedID = parseInt(localStorage.getItem('lastUsedID')) || 200;
    
    // Increment the last used ID by 1
    const newId = lastUsedID + 1;

    // Save the updated last used ID in localStorage
    localStorage.setItem('lastUsedID', newId);

    const newRowData = {
      id: newId, // Set the new row's ID
      title: 'New Task',
      description: 'Enter description here',
      status: 'To Do',
    };

    tabulatorInstance.current.addData([newRowData], false)
      .then(() => {
        tabulatorInstance.current.setPage(tabulatorInstance.current.getPageMax());
        saveTableData();
      })
      .catch(error => console.error('Error adding row:', error));
  };

  // Save the entire table's data to localStorage
  const saveTableData = () => {
    const data = tabulatorInstance.current.getData();
    localStorage.setItem('tableData', JSON.stringify(data));
  };

  /**
   * Merges the API data with the saved local updates.
   * @param {Array} apiData - Data loaded from the API.
   * @param {Array} savedData - Data stored in localStorage.
   * @returns {Array} - The merged array with updated rows.
   */
  const mergeData = (apiData, savedData) => {
    if (!savedData.length) return apiData;

    const mergedData = apiData.map(apiRow => {
      const savedRow = savedData.find(localRow => localRow.id === apiRow.id);
      return savedRow ? { ...apiRow, ...savedRow } : apiRow;
    });

    const newRows = savedData.filter(localRow => !apiData.some(apiRow => apiRow.id === localRow.id));
    return [...mergedData, ...newRows];
  };

  return (
    <div>
      <h5 className="table-heading text-center taskHeading">TASK MANAGEMENT TABLE</h5>
      <div ref={tableRef} id="example-table"></div>
      <div>
        <button id="add-row" onClick={handleAddRow} className="add-row-btn">
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> 
          Add a Row
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Table;

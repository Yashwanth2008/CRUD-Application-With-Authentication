const userManagement = catalyst.userManagement;
const currentUser = userManagement.getCurrentProjectUser();
currentUser
  .then((response) => {
    console.log(response.content);
  })
  .catch((err) => {
    console.log(err);
  });

async function insertOperation() {
  const firstname = document.getElementById("fname").value;
  const lastname = document.getElementById("lname").value;
  const rollnumber = document.getElementById("rollnum").value;
  if (firstname === "" || lastname === "" || rollnumber === "") {
    alert("Please provide some value in all the fields!");
  } else {
    var details = [
      { Firstname: firstname, Lastname: lastname, Rollno: rollnumber },
    ];
    const datastore = catalyst.table;
    const table = datastore.tableId("18046000000435049");
    const insertPromise = table.addRow(details);
    insertPromise
      .then(async (response) => {
        if (response.status === 200) {
          const data = response.content[0];
          const rowId = data.ROWID;

          const rowData = await getRow(rowId);
          console.log(rowData);

          const firstname = rowData.Firstname;
          const lastname = rowData.Lastname;
          const rollnumber = rowData.Rollno;

          const tableBody = document.getElementById("tableBody");
          const newRow = document.createElement("tr");

          const firstnameCell = document.createElement("td");
          const lastnameCell = document.createElement("td");
          const rollnumberCell = document.createElement("td");

          firstnameCell.textContent = firstname;
          lastnameCell.textContent = lastname;
          rollnumberCell.textContent = rollnumber;

          const operationsCell = document.createElement("td");

          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.id = "editbtn";
          editButton.onclick = async function editButton() {
            // try {
            //   const details = [
            //     {
            //       Firstname: "Test",
            //       Lastname: "Update",
            //       Rollno: "22",
            //       ROWID: rowId,
            //     },
            //   ];

            //   await updateRow(details);
            // } catch (error) {
            //   console.log(error);
            // }
            makeRowEditable(newRow, rowId);
          };



          function makeRowEditable(row, rowId) {
            const cells = row.querySelectorAll("td:not(:last-child)"); // Select all cells except the last one (which has the buttons)

            cells.forEach((cell) => {
              const input = document.createElement("input");
              input.id = "editInput";
              input.value = cell.textContent;
              cell.textContent = "";
              cell.appendChild(input);
            });

            // Replace "Edit" button with "Save" button
            const operationsCell = row.querySelector("td:last-child");
            const editButton = operationsCell.querySelector("#editbtn");

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.id = "savebtn";
            saveButton.onclick = async function () {
              await saveRowData(row, rowId);
            };

            operationsCell.replaceChild(saveButton, editButton);
          }




          async function saveRowData(row, rowId) {
            const cells = row.querySelectorAll("td:not(:last-child)");
            const updatedData = {};

            cells.forEach((cell, index) => {
              const input = cell.querySelector("input");
              if (input) {
                const newValue = input.value;
                cell.textContent = newValue;
                if (index === 0) updatedData.Firstname = newValue;
                if (index === 1) updatedData.Lastname = newValue;
                if (index === 2) updatedData.Rollno = newValue;
              }
            });

            // Call API to update the row data in the database
            try {
              await updateRow(rowId, updatedData); // Function to handle the update API call
              console.log(`Row with ID ${rowId} updated in the database.`);
            } catch (err) {
              console.log(
                `Failed to update row with ID ${rowId} in the database:`,
                err
              );
            }

            // Replace "Save" button with "Edit" button
            const operationsCell = row.querySelector("td:last-child");
            const saveButton = operationsCell.querySelector("#savebtn");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.id = "editbtn";
            editButton.onclick = function () {
              makeRowEditable(row, rowId);
            };

            operationsCell.replaceChild(editButton, saveButton);
          }



          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.id = "deletebtn";
          deleteButton.onclick = async function deleteButton() {
            const row = this.parentElement.parentElement;
            tableBody.removeChild(row);
            try {
              await deleteRow(rowId);
              console.log(`Row with ID ${rowId} deleted from the database.`);
            } catch (err) {
              console.log(
                `Failed to delete row with ID ${rowId} from the database:`,
                err
              );
            }
          };

          operationsCell.appendChild(editButton);
          operationsCell.appendChild(deleteButton);

          newRow.appendChild(firstnameCell);
          newRow.appendChild(lastnameCell);
          newRow.appendChild(rollnumberCell);
          newRow.appendChild(operationsCell);

          tableBody.appendChild(newRow);
        } else {
          alert(response.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

async function getRow(rowid) {
  const datastore = catalyst.table;
  const table = datastore.tableId("18046000000435049");
  const row = table.rowId(rowid);
  try {
    const response = await row.get();
    return response.content;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function updateRow(rowId, updatedData) {
  const ROWID = rowId;
  const firstname = updatedData.Firstname;
  const lastname = updatedData.Lastname;
  const Rollno = updatedData.Rollno;
  const details = [
    {
      Firstname: firstname,
      Lastname: lastname,
      Rollno: Rollno,
      ROWID: ROWID,
    },
  ];
  const datastore = catalyst.table;
  const table = datastore.tableId("18046000000435049");
  const updatePromise = table.updateRow(details);
  updatePromise
    .then((response) => {
      console.log(response.content);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function deleteRow(rowID) {
  const datastore = catalyst.table;
  const table = datastore.tableId("18046000000435049");
  const row = table.rowId(rowID);
  try {
    const response = await row.delete();
    console.log(response.content);
  } catch (err) {
    console.log("Error deleting row from database:", err);
    throw err;
  }
}
deleteRow();

function logout() {
  var redirectURL = "https://" + document.domain + "/__catalyst/auth/login";
  console.log(redirectURL);
  debugger;
  var auth = catalyst.auth;
  auth.signOut(redirectURL);
}

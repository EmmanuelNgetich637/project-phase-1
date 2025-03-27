document.addEventListener("DOMContentLoaded", () => {
    loadDrugs();
    document.getElementById("distributeBtn").addEventListener("click", distributeDrug);
});

// Function to load available drugs into the dropdown
function loadDrugs() {
    fetch("http://localhost:3000/drugs")  // Ensure JSON server is running
        .then(response => response.json())
        .then(data => {
            let selectDrug = document.getElementById("selectDrug");
            let drugList = document.getElementById("drugList");

            // Clear previous entries
            selectDrug.innerHTML = '<option value="">-- Select Drug --</option>';
            drugList.innerHTML = "";

            data.forEach(drug => {
                // Populate the dropdown
                let option = document.createElement("option");
                option.value = drug.id;  // Store drug ID
                option.textContent = `${drug.name} (${drug.stock} left)`;
                selectDrug.appendChild(option);

                // Display available drugs in the table
                let row = document.createElement("tr");
                row.innerHTML = `<td>${drug.name}</td><td>${drug.stock}</td>`;
                drugList.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching drugs:", error));
}

// Function to handle drug distribution
function distributeDrug() {
    let hospitalName = document.getElementById("hospitalName").value.trim();
    let drugId = document.getElementById("selectDrug").value;
    let quantity = parseInt(document.getElementById("quantity").value);

    if (!hospitalName || !drugId || isNaN(quantity) || quantity <= 0) {
        alert("Please fill all fields correctly.");
        return;
    }

    // Fetch the selected drug details
    fetch(`http://localhost:3000/drugs/${drugId}`)
        .then(response => response.json())
        .then(drug => {
            if (quantity > drug.stock) {
                alert("Not enough stock available.");
                return;
            }

            // Update drug stock
            let newStock = drug.stock - quantity;
            fetch(`http://localhost:3000/drugs/${drugId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: newStock })
            })
            .then(() => {
                // Record the distribution
                let distributionRecord = {
                    hospital: hospitalName,
                    drug: drug.name,
                    quantity: quantity
                };

                fetch("http://localhost:3000/distributions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(distributionRecord)
                })
                .then(() => {
                    alert(`Successfully distributed ${quantity} of ${drug.name} to ${hospitalName}`);
                    loadDrugs(); // Refresh drug list
                    loadDistributionRecords(); // Refresh distribution records
                });
            });
        })
        .catch(error => console.error("Error updating stock:", error));
}

// Function to load distribution records
function loadDistributionRecords() {
    fetch("http://localhost:3000/distributions")
        .then(response => response.json())
        .then(data => {
            let recordsTable = document.getElementById("distributionRecords");
            recordsTable.innerHTML = "";

            data.forEach(record => {
                let row = document.createElement("tr");
                row.innerHTML = `<td>${record.hospital}</td><td>${record.drug}</td><td>${record.quantity}</td>`;
                recordsTable.appendChild(row);
            });
        })
        .catch(error => console.error("Error fetching distribution records:", error));
}
fetch("http://localhost:3000/drugs")
  .then(res => res.json())
  .then(data => console.log("Drugs Data:", data))
  .catch(err => console.error("Error:", err));

  document.getElementById("hospitalName").value = "";
  document.getElementById("quantity").value = "";

// Load existing distribution records on page load
document.addEventListener("DOMContentLoaded", loadDistributionRecords);
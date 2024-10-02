document.addEventListener('DOMContentLoaded', function () {
    let totalIncome = 0;
    let totalExpense = 0;

    // Récupération des éléments du DOM
    const budgetInput = document.getElementById('budget');
    const saveButton = document.getElementById('saveBudget');
    const budgetError = document.getElementById('budgetError');
    const totalIncomeElem = document.getElementById('totalIncome');
    const totalExpenseElem = document.getElementById('totalExpense');
    const balanceElem = document.getElementById('balance');
    const transactionHistory = document.getElementById('transactionHistory');
    const transactionForm = document.getElementById('transactionForm');
    const nameInput = document.getElementById('name');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const categoryLabel = document.getElementById('categoryLabel');
    
    typeSelect.addEventListener('change', function () {
        if (typeSelect.value === 'income') {
            categorySelect.style.display = 'none';
            categoryLabel.style.display = 'none'; // Masquer le label
        } else {
            categorySelect.style.display = 'inline-block';
            categoryLabel.style.display = 'inline-block'; // Afficher le label
        }
    });

    // Charger le budget au démarrage
    loadBudget();

    // Détecter l'appui sur la touche Entrée pour enregistrer le budget
    budgetInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            saveButton.click(); // Déclencher un clic sur le bouton "Enregistrer"
        }
    });

    saveButton.addEventListener('click', function () {
        const budgetValue = parseFloat(budgetInput.value);

        // Validation du budget
        if (!isNaN(budgetValue) && budgetValue > 0) {
            saveBudget(budgetValue);
            alert("Budget enregistré avec succès !");
            budgetError.style.display = 'none'; // Cacher le message d'erreur
        } else {
            budgetError.textContent = "Veuillez entrer un montant de budget valide.";
            budgetError.style.display = 'block'; // Afficher le message d'erreur
        }
    });

    // Fonction pour sauvegarder le budget dans le localStorage
    function saveBudget(budget) {
        localStorage.setItem('budget', budget);
    }

    // Charger le budget depuis le localStorage
    function loadBudget() {
        const budget = localStorage.getItem('budget');
        if (budget) {
            budgetInput.value = budget;
        }
    }

    // Vérifier si le budget est dépassé
    function checkBudgetAlert() {
        const budget = parseFloat(localStorage.getItem('budget')) || 0;
        const totalExpenses = totalExpense;

        if (totalExpenses > budget * 0.8) {
            alert("Attention : Vous avez dépassé 80% de votre budget !");
        }
    }

    // Charger l'historique des transactions
    loadTransactions();

    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactionHistory')) || [];
        console.log('Transactions chargées:', transactions); // Ajout d'un log

        transactions.forEach(transaction => {
            addTransactionToDOM(transaction);
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        });

        // Mettre à jour les totaux après le chargement
        updateTotals();
        console.log('Total des revenus:', totalIncome, 'Total des dépenses:', totalExpense); // Ajout d'un log
    }

    // Mettre à jour les totaux
    function updateTotals() {
        totalIncomeElem.textContent = totalIncome.toFixed(2);
        totalExpenseElem.textContent = totalExpense.toFixed(2);
        balanceElem.textContent = (totalIncome - totalExpense).toFixed(2);
    }

    // Événement de soumission du formulaire
    transactionForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Empêcher le rechargement de la page

        const nameValue = nameInput.value;
        const amountValue = parseFloat(amountInput.value);
        const typeValue = typeSelect.value;
        const categoryValue = typeValue === 'income' ? null : categorySelect.value;

        // Validation du montant
        if (isNaN(amountValue) || amountValue <= 0) {
            amountInput.classList.add('input-error'); // Ajouter la classe d'erreur
            alert("Veuillez entrer un montant valide.");
            return;
        } else {
            amountInput.classList.remove('input-error'); // Retirer la classe d'erreur si valide
        }

        // Si c'est une dépense, assurez-vous qu'une catégorie est sélectionnée
        if (typeValue === 'expense' && !categoryValue) {
            alert("Veuillez sélectionner une catégorie pour la dépense.");
            return;
        }

        const transaction = {
            name: nameValue,
            amount: amountValue,
            type: typeValue,
            category: categoryValue
        };

        // Ajouter la transaction au DOM et au localStorage
        addTransactionToDOM(transaction);
        saveTransaction(transaction);

        // Mettre à jour les totaux selon le type de transaction
        if (typeValue === 'income') {
            totalIncome += amountValue; // Mettre à jour le total des revenus
        } else {
            totalExpense += amountValue; // Mettre à jour le total des dépenses
            checkBudgetAlert(); // Appel à la fonction d'alerte
        }

        // Mettre à jour les totaux après l'ajout de la transaction
        updateTotals();

        // Réinitialiser les champs du formulaire
        this.reset(); // Réinitialise le formulaire
        categorySelect.style.display = 'none'; // Masquer la catégorie après soumission
    });

    // Ajouter une transaction au DOM
    function addTransactionToDOM(transaction) {
        const newTransaction = document.createElement('li');
        newTransaction.textContent = `${transaction.name} - ${transaction.amount.toFixed(2)}€ - ${transaction.type === 'income' ? 'Revenu' : 'Dépense'} [${transaction.category}]`;

        // Créer la chaîne de texte pour la transaction
    const transactionText = `${transaction.name} - ${transaction.amount.toFixed(2)}€ - ${transaction.type === 'income' ? 'Revenu' : 'Dépense'}`;
    
    // Ajouter la catégorie uniquement si elle n'est pas nulle
    if (transaction.category) {
        newTransaction.textContent = `${transactionText} [${transaction.category}]`;
    } else {
        newTransaction.textContent = transactionText; // Afficher sans la catégorie
    }
        
        // Créer le bouton "Supprimer"
        const deleteButton = createDeleteButton(transaction, newTransaction);
        newTransaction.appendChild(deleteButton);

        // Ajouter la transaction à l'historique
        transactionHistory.appendChild(newTransaction);
    }

    // Créer le bouton "Supprimer"
    function createDeleteButton(transaction, transactionElement) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';

        deleteButton.addEventListener('click', function () {
            transactionElement.remove(); // Supprimer l'élément de la transaction

            // Mettre à jour les totaux
            if (transaction.type === 'income') {
                totalIncome -= transaction.amount; // Mettre à jour le total des revenus
            } else {
                totalExpense -= transaction.amount; // Mettre à jour le total des dépenses
            }

            // Supprimer la transaction du localStorage
            removeTransaction(transaction);
            updateTotals();
        });

        return deleteButton;
    }

    // Sauvegarder une transaction dans le localStorage
    function saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactionHistory')) || [];
        transactions.push(transaction);
        localStorage.setItem('transactionHistory', JSON.stringify(transactions));
    }

    // Supprimer une transaction du localStorage
    function removeTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactionHistory')) || [];
        transactions = transactions.filter(t => 
            !(t.name === transaction.name && 
              t.amount === transaction.amount && 
              t.type === transaction.type && 
              t.category === transaction.category)
        );
        localStorage.setItem('transactionHistory', JSON.stringify(transactions));
    }
});

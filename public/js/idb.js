let db;
const request = indexedDB.open( 'budget-pwa', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function( event ) {
    db = event.target.result;
    if( navigator.onLine ){
        uploadBudgetItem()
    }
}

request.onerror = function( event ) {
    console.log( event.target.errorCode )
}

function saveRecord( record ){
    const transaction = db.transaction( [ 'new_budget' ], 'readwrite' )
    const budgetObjectStore = transaction.objectStore( 'new_budget' )
    budgetObjectStore.add( record )
}

function uploadBudgetItem() {
    const transaction = db.transaction( [ 'new_budget' ], 'readwrite' );
    const budgetObjectStore = transaction.objectStore( 'new_budget' );
    const getAll = budgetObjectStore.getAll()
    
    getAll.onsuccess = function() {
        console.log( getAll.result )
        if( getAll.result.length > 0 ){
            console.log( JSON.stringify( getAll.result) )
            fetch( '/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify( getAll.result ),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Conent-Type': 'application/json'
                }
            } )
            .then( response => response.json() )
            .then( serverResponse => {
                console.log( serverResponse )
                if( serverResponse.message ){
                    throw new Error( serverResponse )
                }
                const transaction = db.transaction( [ 'new_budget' ], 'readwrite' )

                const budgetObjectStore = transaction.objectStore( 'new_budget' )
                
                budgetObjectStore.clear()

                alert( 'All saved transactions have been submitted')
            } )
            .catch( err => 
                console.log( err ) 
            ) }
    }
}

window.addEventListener( 'online', uploadBudgetItem )
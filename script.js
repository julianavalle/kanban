document.addEventListener('DOMContentLoaded', function() {
  // Elementos principais
  const kanbanBoard = document.getElementById('kanbanBoard');
  const addColumnBtn = document.getElementById('addColumnBtn');
  const addColumnForm = document.getElementById('addColumnForm');
  const columnInput = document.getElementById('columnInput');
  const addColumnSubmit = document.getElementById('addColumnSubmit');
  const cancelAddColumn = document.getElementById('cancelAddColumn');

  // Mostrar/ocultar formulário de nova coluna
  addColumnBtn.addEventListener('click', function() {
    addColumnBtn.style.display = 'none';
    addColumnForm.style.display = 'flex';
    columnInput.focus();
  });

  cancelAddColumn.addEventListener('click', function() {
    addColumnForm.style.display = 'none';
    addColumnBtn.style.display = 'block';
    columnInput.value = '';
  });

  // Adicionar nova coluna
  addColumnSubmit.addEventListener('click', function() {
    const columnTitle = columnInput.value.trim();
    if (columnTitle) {
      addColumn(columnTitle);
      columnInput.value = '';
      addColumnForm.style.display = 'none';
      addColumnBtn.style.display = 'block';
    }
  });

  columnInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addColumnSubmit.click();
    }
  });

  // Adicionar colunas iniciais
  addColumn('A fazer');
  addColumn('Fazendo');
  addColumn('Feito');

  // Função para adicionar uma nova coluna
  function addColumn(title) {
    const columnId = 'column-' + Date.now();
    const column = document.createElement('div');

    column.className = 'kanban-column';
    column.id = columnId;
    
    column.innerHTML = `
      <div class="column-header">
        <span>${title}</span>
        <button class="delete-column" data-column-id="${columnId}">×</button>
      </div>
      <div class="kanban-cards" id="cards-${columnId}"></div>
      <button class="add-card-btn" data-column-id="${columnId}">+ Adicionar um card</button>
      <div class="card-form" id="form-${columnId}">
          <textarea class="card-textarea" placeholder="Digite um título para este card..."></textarea>
          <div class="form-actions">
            <button class="add-card" data-column-id="${columnId}">Adicionar card</button>
            <button class="cancel-card" data-column-id="${columnId}">×</button>
          </div>
      </div>
    `;
    
    const kanbanBoard = document.getElementById('kanbanBoard');
    const addColumnBtn = document.getElementById('addColumnBtn');
    
    if (kanbanBoard && addColumnBtn && kanbanBoard.contains(addColumnBtn)) {
      kanbanBoard.insertBefore(column, addColumnBtn);
    } else {
      // Fallback - append to the end
      kanbanBoard.appendChild(column);
    }
    
    // Configurar eventos para a nova coluna
    setupColumnEvents(columnId);
  }

  // Configurar eventos para uma coluna
  function setupColumnEvents(columnId) {
    const addCardBtn = document.querySelector(`.add-card-btn[data-column-id="${columnId}"]`);
    const cardForm = document.getElementById(`form-${columnId}`);
    const addCardSubmit = cardForm.querySelector('.add-card');
    const cancelCard = cardForm.querySelector('.cancel-card');
    const textarea = cardForm.querySelector('.card-textarea');
    const deleteColumnBtn = document.querySelector(`.delete-column[data-column-id="${columnId}"]`);
      
    addCardBtn.addEventListener('click', function() {
      addCardBtn.style.display = 'none';
      cardForm.style.display = 'flex';
      textarea.focus();
    });
    
    cancelCard.addEventListener('click', function() {
      cardForm.style.display = 'none';
      addCardBtn.style.display = 'block';
      textarea.value = '';
    });
      
    addCardSubmit.addEventListener('click', function() {
      const cardText = textarea.value.trim();
      if (cardText) {
        addCard(columnId, cardText);
        textarea.value = '';
        cardForm.style.display = 'none';
        addCardBtn.style.display = 'block';
      }
    });
      
    textarea.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addCardSubmit.click();
      }
    });
      
    deleteColumnBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja excluir esta coluna e todos os seus cards?')) {
        document.getElementById(columnId).remove();
      }
    });
  }

  // Adicionar um novo card a uma coluna
  function addCard(columnId, text) {
    const cardId = 'card-' + Date.now();
    const cardsContainer = document.getElementById(`cards-${columnId}`);
    
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.id = cardId;
    card.textContent = text;
    card.setAttribute('draggable', 'true');
    
    cardsContainer.appendChild(card);
    
    // Configurar eventos de arrastar/soltar
    setupDragEvents(cardId);
  }

  // Configurar eventos de arrastar/soltar para um card
  function setupDragEvents(cardId) {
    const card = document.getElementById(cardId);
    
    card.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', cardId);
      setTimeout(() => {
          card.style.display = 'none';
      }, 0);
    });
    
    card.addEventListener('dragend', function() {
      card.style.display = 'block';
    });
  }

  // Configurar eventos de soltar para todas as colunas
  document.querySelectorAll('.kanban-column').forEach(column => {
    column.addEventListener('dragover', function(e) {
      e.preventDefault();
    });
    
    column.addEventListener('drop', function(e) {
      e.preventDefault();
      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.getElementById(cardId);
      const cardsContainer = this.querySelector('.kanban-cards');
      
      // Verifica se o card está sendo arrastado sobre outro card
      const afterElement = getDragAfterElement(cardsContainer, e.clientY);
      if (afterElement) {
        cardsContainer.insertBefore(card, afterElement);
      } else {
        cardsContainer.appendChild(card);
      }
    });
  });

  // Função auxiliar para determinar a posição de soltar
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
});
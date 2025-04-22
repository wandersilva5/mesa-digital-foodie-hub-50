import { useState, useEffect } from 'react';
import { InventoryItem, getCurrentStock, getMinimumStock } from '../../services/inventoryService';

interface RestockModalProps {
  item: InventoryItem;
  onClose: () => void;
  onRestock: (newQuantity: number) => void;
}

const RestockModal = ({ item, onClose, onRestock }: RestockModalProps) => {
  const [currentStock, setCurrentStock] = useState(0);
  const [minimumStock, setMinimumStock] = useState(0);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const loadStockInfo = async () => {
      try {
        const [current, minimum] = await Promise.all([
          getCurrentStock(item.id),
          getMinimumStock(item.id)
        ]);
        setCurrentStock(current);
        setMinimumStock(minimum);
        setQuantity(minimum); // Define quantidade inicial como estoque mínimo
      } catch (error) {
        console.error("Error loading stock info:", error);
      }
    };

    loadStockInfo();
  }, [item.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRestock(quantity);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Repor Estoque: {item.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="current-stock-info">
          <p>Estoque Atual: <strong>{currentStock} {item.unit}</strong></p>
          <p>Estoque Mínimo: <strong>{minimumStock} {item.unit}</strong></p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Nova Quantidade em Estoque</label>
            <input
              type="number"
              id="quantity"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={minimumStock}
              required
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
            >
              Confirmar Reposição
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
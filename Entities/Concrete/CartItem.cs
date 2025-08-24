using Core.Entities;

namespace Entities.Concrete
{
    public class CartItem: IEntity
    {
        public int Id { get; set; }
        public int CartId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    
    }
}

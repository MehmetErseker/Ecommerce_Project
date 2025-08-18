using Core.Entities;

namespace Entities.Concrete
{
    public class Cart:IEntity
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public List<CartItem> CartItems { get; set; } = new List<CartItem>();
        public decimal TotalPrice { get; set; }
    }
}

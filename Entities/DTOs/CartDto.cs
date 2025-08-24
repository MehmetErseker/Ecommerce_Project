using Core.Entities;

namespace Entities.Concrete
{
    public class CartDto : IDto
    {
        public int UserId { get; set; }
        public List<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();
        public decimal TotalPrice { get; set; }
    }
}

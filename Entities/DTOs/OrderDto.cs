using Core.Entities;

namespace Entities.Concrete
{
    public class OrderDto : IDto
    {
        public int UserId { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; }
        public DateTime Date { get; set; }
        public decimal TotalPrice { get; set; }
        public string OrderStatus { get; set; }
    }
}

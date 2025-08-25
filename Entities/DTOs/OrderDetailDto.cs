using Core.Entities;

namespace Entities.Concrete
{
    public class OrderDetailDto : IDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

    }
}

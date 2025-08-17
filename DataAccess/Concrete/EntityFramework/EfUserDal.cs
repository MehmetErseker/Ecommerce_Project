using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using Entities.Concrete;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace DataAccess.Concrete.EntityFramework
{
    public class EfUserDal : EfEntityRepositoryBase<User, Context>, IUserDal
    {
        public async Task<List<User>> GetAllWithAddresses(Expression<Func<User, bool>> filter = null)
        {
            using (Context context = new Context())
            {
                var query = context.Users
                                   .Include(u => u.Addresses)
                                   .AsQueryable();

                if (filter != null)
                    query = query.Where(filter);

                return query.ToList();
            }
        }
    }

}

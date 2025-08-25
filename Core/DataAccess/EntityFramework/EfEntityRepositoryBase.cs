using Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Core.DataAccess.EntityFramework
{
    public class EfEntityRepositoryBase<TEntity, TContext> : IEntityRepository<TEntity>
        where TEntity : class, IEntity, new()
        where TContext : DbContext, new()
    {
        //public async Task Add(TEntity entity)
        //{
        //    using (TContext context = new TContext())
        //    {
        //        var addedEntity = context.Entry(entity);
        //        addedEntity.State = EntityState.Added;
        //        await context.SaveChangesAsync();
        //    }
        //}

        public async Task Add(TEntity entity)
        {
            using (TContext context = new TContext())
            {
                await context.Set<TEntity>().AddAsync(entity);
                await context.SaveChangesAsync();
            }
        }


        public async Task Delete(TEntity entity)
        {
            using (TContext context = new TContext())
            {
                context.Set<TEntity>().Remove(entity);
                await context.SaveChangesAsync();
            }
        }

        public async Task<TEntity> Get(Expression<Func<TEntity, bool>> filter)
        {
            using (TContext context = new TContext())
            {
                return await context.Set<TEntity>().SingleOrDefaultAsync(filter);
            }
        }

        //public async Task<List<TEntity>> GetAll(Expression<Func<TEntity, bool>> filter = null)
        //{
        //    using (TContext context = new TContext())
        //    {
        //        return filter == null
        //            ? await context.Set<TEntity>().ToListAsync()
        //            : await context.Set<TEntity>().Where(filter).ToListAsync();
        //    }
        //}

        public async Task<List<TEntity>> GetAll(
            Expression<Func<TEntity, bool>> filter = null,
            int pageNumber = 1, int pageSize = 10)
        {

            using (var context = new TContext())
            {
                IQueryable<TEntity> query = context.Set<TEntity>();
                if (filter != null)
                {
                    query = query.Where(filter);
                }
                
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                return await query.ToListAsync();
            }
        }

        public Task<List<TEntity>> GetByCategoryId(int categoryId)
        {
            throw new NotImplementedException();
        }

        public async Task Update(TEntity entity)
        {
            using (TContext context = new TContext())
            {
                context.Set<TEntity>().Update(entity);
                await context.SaveChangesAsync();
            }
        }
    }
}

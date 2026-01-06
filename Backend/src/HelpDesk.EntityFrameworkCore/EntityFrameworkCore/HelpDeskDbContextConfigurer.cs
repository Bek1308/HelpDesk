using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace HelpDesk.EntityFrameworkCore;

public static class HelpDeskDbContextConfigurer
{
    public static void Configure(DbContextOptionsBuilder<HelpDeskDbContext> builder, string connectionString)
    {
        builder.UseSqlServer(connectionString);
    }

    public static void Configure(DbContextOptionsBuilder<HelpDeskDbContext> builder, DbConnection connection)
    {
        builder.UseSqlServer(connection);
    }
}

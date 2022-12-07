library("rjson")
path <- getwd()

the_frame <- fromJSON(file = paste(path, "/out_data.json", sep = ""))

table_please <- rbindlist(the_frame, fill=TRUE)

filter_repeats <- unique(table_please, by = "video_id")

remove_na <- na.omit(filter_repeats)

remove_unlisted <- remove_na[,unlisted:=NULL]

change_views <- remove_unlisted[, views:=as.integer(views)]

change_duration <- change_views[, duration:=as.integer(duration)]

factor_cat <- change_duration[, category:=as.factor(category)]

factor_day <- factor_cat[, dayofweek:=as.factor(dayofweek)]

factor_month <- factor_day[, month:=as.factor(month)]

factor_color <- factor_month[, closest_color:=as.factor(closest_color)]

factor_fs <- factor_color[, family_safe:=as.factor(family_safe)]

factor_cv <-factor_fs[, channel_verified:=as.factor(channel_verified)]

factor_ar <-factor_cv[, age_restricted:=as.factor(age_restricted)]

final_output <- as.data.frame(factor_ar)

summary(final_output)

save(final_output, file="data_final.Rda")

testing <- load("data_final.Rda")

import React from "react"
import { Menu as MenuIcon } from "@material-ui/icons"
import { AppBar, Toolbar, IconButton, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}))

export function ActionBar() {
  const classes = useStyles()

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          XDV Universal Wallet
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
